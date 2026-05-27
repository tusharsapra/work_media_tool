import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus, Search, Archive, Pencil, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddProjectModal } from "@/components/client/AddProjectModal";
import { ArchiveProjectDialog } from "@/components/client/ArchiveProjectDialog";
import { groupBySlug } from "@/data/projectGroups";
import { OBJECTIVES } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";
import type { ClientWorkspace } from "@mpa/shared";

type SortKey = "recent" | "alpha" | "plans";
const ALL = "__all__";

export function ProjectList() {
  const { group: groupSlug } = useParams<{ group: string }>();
  const navigate = useNavigate();
  const clients = usePlanStore((s) => s.clients);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("recent");
  const [showArchived, setShowArchived] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<ClientWorkspace | null>(null);

  const groupInfo = groupBySlug(groupSlug);

  const inGroup = useMemo(
    () => clients.filter((c) => groupInfo && c.projectGroup === groupInfo.id),
    [clients, groupInfo]
  );

  const categories = useMemo(
    () => Array.from(new Set(inGroup.map((c) => c.industry).filter(Boolean))) as string[],
    [inGroup]
  );

  const visible = useMemo(() => {
    let list = inGroup.filter((c) => c.archived === showArchived);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.industry ?? "").toLowerCase().includes(q) ||
          (c.projectContext ?? "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== ALL) list = list.filter((c) => c.industry === categoryFilter);
    const sorted = [...list];
    if (sort === "alpha") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "plans") sorted.sort((a, b) => b.plans.length - a.plans.length);
    else
      sorted.sort((a, b) =>
        (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)
      );
    return sorted;
  }, [inGroup, showArchived, query, categoryFilter, sort]);

  if (!groupInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Project group not found.</p>
        <Button onClick={() => navigate("/")}>Back to groups</Button>
      </div>
    );
  }

  const archivedCount = inGroup.filter((c) => c.archived).length;

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        All groups
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{groupInfo.label}</h1>
          <p className="text-muted-foreground mt-1">{groupInfo.description}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add project
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently updated</SelectItem>
            <SelectItem value="alpha">Alphabetical</SelectItem>
            <SelectItem value="plans">Most plans</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showArchived ? "primary" : "secondary"}
          onClick={() => setShowArchived((v) => !v)}
        >
          <Archive className="h-4 w-4" />
          {showArchived ? "Viewing archived" : `Archived (${archivedCount})`}
        </Button>
      </div>

      {visible.length === 0 ? (
        <Card accent="cyan" className="p-10 text-center">
          <h3 className="text-lg font-bold tracking-tight mb-1">
            {showArchived ? "No archived projects" : "No projects yet"}
          </h3>
          <p className="text-muted-foreground mb-5">
            {showArchived
              ? "Archived projects will appear here."
              : `Add the first project under ${groupInfo.label}.`}
          </p>
          {!showArchived && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((project) => (
            <ProjectListCard
              key={project.id}
              project={project}
              groupLabel={groupInfo.id === "bajaj" ? "Bajaj" : "Non-Bajaj"}
              archivedView={showArchived}
              onArchive={() => setArchiveTarget(project)}
            />
          ))}
        </div>
      )}

      <AddProjectModal open={addOpen} onOpenChange={setAddOpen} defaultGroup={groupInfo.id} />
      <ArchiveProjectDialog
        projectId={archiveTarget?.id ?? null}
        projectName={archiveTarget?.name ?? ""}
        open={archiveTarget !== null}
        onOpenChange={(o) => !o && setArchiveTarget(null)}
      />
    </div>
  );
}

function ProjectListCard({
  project,
  groupLabel,
  archivedView,
  onArchive,
}: {
  project: ClientWorkspace;
  groupLabel: string;
  archivedView: boolean;
  onArchive: () => void;
}) {
  const navigate = useNavigate();
  const unarchive = usePlanStore((s) => s.unarchiveProject);
  const objective = project.defaultObjective
    ? OBJECTIVES.find((o) => o.id === project.defaultObjective)?.label
    : undefined;

  return (
    <Card accent="cyan" className="flex flex-col h-full">
      <CardContent className="pt-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold tracking-tight">{project.name}</h3>
          <Badge variant="muted">{groupLabel}</Badge>
        </div>
        <div className="text-sm text-muted-foreground mb-3">
          {project.industry ?? "Uncategorized"}
        </div>
        {project.projectContext && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {project.projectContext}
          </p>
        )}
        {objective && (
          <div className="text-xs text-muted-foreground mb-3">Focus: {objective}</div>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xs text-muted-foreground">
            {project.plans.length} {project.plans.length === 1 ? "plan" : "plans"}
          </span>
          <div className="flex items-center gap-1">
            {archivedView ? (
              <Button variant="secondary" size="sm" onClick={() => unarchive(project.id)}>
                <RotateCcw className="h-3.5 w-3.5" />
                Restore
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit project"
                  onClick={() => navigate(`/clients/${project.id}?tab=settings`)}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Archive project"
                  onClick={onArchive}
                >
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button size="sm" onClick={() => navigate(`/clients/${project.id}`)}>
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
