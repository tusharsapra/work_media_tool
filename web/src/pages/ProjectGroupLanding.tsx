import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/layout/BrandMark";
import { AddProjectModal } from "@/components/client/AddProjectModal";
import { PROJECT_GROUPS } from "@/data/projectGroups";
import { usePlanStore } from "@/store/usePlanStore";

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function ProjectGroupLanding() {
  const navigate = useNavigate();
  const clients = usePlanStore((s) => s.clients);
  const [addOpen, setAddOpen] = useState(false);

  const stats = useMemo(() => {
    return PROJECT_GROUPS.map((g) => {
      const inGroup = clients.filter((c) => c.projectGroup === g.id && !c.archived);
      const lastUpdated = inGroup
        .map((c) => c.updatedAt ?? c.createdAt)
        .sort()
        .at(-1);
      return { group: g, count: inGroup.length, lastUpdated };
    });
  }, [clients]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <BrandMark size={40} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ARM Media Planning OS</h1>
            <p className="text-muted-foreground mt-1">
              Create, forecast, review, and export structured media plans across ARM projects.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stats.map(({ group, count, lastUpdated }) => (
          <Card
            key={group.id}
            accent="cyan"
            onClick={() => navigate(`/projects/${group.slug}`)}
            className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,17,17,0.08)] group"
          >
            <CardContent className="pt-7 pb-7">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {group.label}
                </h2>
                <Badge variant="primary">{count} {count === 1 ? "project" : "projects"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">
                {group.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Last updated {relativeTime(lastUpdated)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open projects
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddProjectModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
