import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Plus, FileText, ArrowRight, Globe, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlanStore } from "@/store/usePlanStore";
import { formatDateRange, formatCurrency } from "@/utils/formatters";
import { CURRENCIES, INDUSTRIES, OBJECTIVES } from "@/data/defaults";
import { groupById } from "@/data/projectGroups";
import type { ClientWorkspace, Currency, GeographyPlanType, Objective, ProjectGroup } from "@mpa/shared";

const NONE = "__none__";

export function ProjectWorkspace() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const project = usePlanStore((s) => s.clients.find((c) => c.id === clientId));
  const setCurrentClient = usePlanStore((s) => s.setCurrentClient);

  useEffect(() => {
    if (clientId) setCurrentClient(clientId);
  }, [clientId, setCurrentClient]);

  if (!project || !clientId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Project not found.</p>
        <Button onClick={() => navigate("/")}>Back to projects</Button>
      </div>
    );
  }

  const group = groupById(project.projectGroup);
  const defaultTab = searchParams.get("tab") ?? "overview";

  return (
    <div>
      <Link
        to={`/projects/${group.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        {group.label}
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.projectGroup === "bajaj" ? "primary" : "muted"}>
              {project.projectGroup === "bajaj" ? "Bajaj" : "Non-Bajaj"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {project.industry && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {project.industry}
              </span>
            )}
            {project.website && (
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {project.website.replace(/^https?:\/\//, "")}
              </span>
            )}
            {project.currency && <Badge variant="default">{project.currency}</Badge>}
          </div>
        </div>
        <Button onClick={() => navigate(`/clients/${project.id}/plans/new`)}>
          <Plus className="h-4 w-4" />
          New plan
        </Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="settings">Project settings</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab project={project} />
        </TabsContent>
        <TabsContent value="plans">
          <PlansTab project={project} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab project={project} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ project }: { project: ClientWorkspace }) {
  const navigate = useNavigate();
  const recentPlans = [...project.plans]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);
  const objective = project.defaultObjective
    ? OBJECTIVES.find((o) => o.id === project.defaultObjective)?.label
    : "Not set";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card accent="cyan" className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Project context</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {project.projectContext || "No context added yet. Add it in the Notes tab."}
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Meta label="Default objective" value={objective ?? "Not set"} />
            <Meta
              label="Default geography"
              value={project.defaultGeographyType ? capitalize(project.defaultGeographyType) : "Not set"}
            />
            <Meta label="Default currency" value={project.currency ?? "Set at plan"} />
          </div>
        </CardContent>
      </Card>

      <Card accent="purple">
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" onClick={() => navigate(`/clients/${project.id}/plans/new`)}>
            <Plus className="h-4 w-4" />
            Create monthly plan
          </Button>
          <div className="text-sm text-muted-foreground pt-2">
            {project.plans.length} {project.plans.length === 1 ? "plan" : "plans"} saved
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Recent plans</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No plans yet — create your first monthly plan to generate a forecast and dashboard.
            </p>
          ) : (
            <div className="space-y-2">
              {recentPlans.map((p) => (
                <Link
                  key={p.id}
                  to={`/clients/${project.id}/plans/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-[12px] bg-background hover:bg-border/40 transition-colors"
                >
                  <span className="font-semibold text-sm">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateRange(p.planningStart, p.planningEnd)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PlansTab({ project }: { project: ClientWorkspace }) {
  const navigate = useNavigate();
  if (project.plans.length === 0) {
    return (
      <Card accent="cyan" className="p-10 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-bold tracking-tight mb-1">
          Turn planning inputs into client-ready forecasts
        </h3>
        <p className="text-muted-foreground mb-5">
          Create your first media plan to generate forecasts and a stakeholder dashboard.
        </p>
        <Button onClick={() => navigate(`/clients/${project.id}/plans/new`)}>
          Create media plan
        </Button>
      </Card>
    );
  }
  return (
    <div className="grid gap-3">
      {project.plans.map((plan) => (
        <Link key={plan.id} to={`/clients/${project.id}/plans/${plan.id}`}>
          <Card className="hover:-translate-y-0.5 transition-all hover:shadow-[0_8px_24px_rgba(17,17,17,0.06)]">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold tracking-tight">{plan.name}</h3>
                  <Badge variant="muted" className="capitalize">
                    {plan.type.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="primary" className="capitalize">
                    {plan.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-3">
                  <span>{formatDateRange(plan.planningStart, plan.planningEnd)}</span>
                  <span>•</span>
                  <span>{formatCurrency(plan.totalBudget, plan.currency)}</span>
                  <span>•</span>
                  <span>
                    {OBJECTIVES.find((o) => o.id === plan.objective)?.label} ({plan.primaryKPI})
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function SettingsTab({ project }: { project: ClientWorkspace }) {
  const update = usePlanStore((s) => s.updateProjectSettings);
  const [name, setName] = useState(project.name);
  const [group, setGroup] = useState<ProjectGroup>(project.projectGroup);
  const [industry, setIndustry] = useState(project.industry ?? INDUSTRIES[0]);
  const [website, setWebsite] = useState(project.website ?? "");
  const [currency, setCurrency] = useState<string>(project.currency ?? NONE);
  const [geoType, setGeoType] = useState<GeographyPlanType>(project.defaultGeographyType ?? "india");
  const [objective, setObjective] = useState<string>(project.defaultObjective ?? NONE);
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(
    () =>
      name !== project.name ||
      group !== project.projectGroup ||
      industry !== (project.industry ?? INDUSTRIES[0]) ||
      website !== (project.website ?? "") ||
      currency !== (project.currency ?? NONE) ||
      geoType !== (project.defaultGeographyType ?? "india") ||
      objective !== (project.defaultObjective ?? NONE),
    [name, group, industry, website, currency, geoType, objective, project]
  );

  const save = () => {
    update(project.id, {
      name: name.trim() || project.name,
      projectGroup: group,
      industry,
      website: website.trim() || undefined,
      currency: currency === NONE ? undefined : (currency as Currency),
      defaultGeographyType: geoType,
      defaultObjective: objective === NONE ? undefined : (objective as Objective),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card accent="cyan" className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Project settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Project name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Group</Label>
            <Select value={group} onValueChange={(v) => setGroup(v as ProjectGroup)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bajaj">Bajaj</SelectItem>
                <SelectItem value="non_bajaj">Non-Bajaj</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Industry / category</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Default currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue placeholder="Set at plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Set at plan</SelectItem>
                {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default geography</Label>
            <Select value={geoType} onValueChange={(v) => setGeoType(v as GeographyPlanType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="india">India</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default objective</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger><SelectValue placeholder="Set later" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Not set</SelectItem>
                {OBJECTIVES.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} disabled={!dirty}>Save settings</Button>
          {saved && <span className="text-sm text-success font-semibold">Saved</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function NotesTab({ project }: { project: ClientWorkspace }) {
  const update = usePlanStore((s) => s.updateProjectSettings);
  const [context, setContext] = useState(project.projectContext ?? "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    update(project.id, { projectContext: context.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card accent="cyan" className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Project notes & context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Project context</Label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={6}
            placeholder="Category focus, planning context, internal notes for this project."
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={context === (project.projectContext ?? "")}>
            Save notes
          </Button>
          {saved && <span className="text-sm text-success font-semibold">Saved</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
        {label}
      </div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
