import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePlanStore } from "@/store/usePlanStore";
import { OBJECTIVES, PLATFORMS } from "@/data/defaults";
import { formatCurrency, formatDateRange, formatNumber, monthsBetween } from "@/utils/formatters";
import { calculateForecast } from "@/utils/forecastEngine";
import type { PlanningNotes } from "@mpa/shared";

export function WizardReviewConfirm() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);
  const setNote = (key: keyof PlanningNotes, value: string) =>
    setField("notes", { ...wizard.notes, [key]: value });
  const netBudget = wizard.totalBudget * (1 - wizard.agencyFeePct / 100);
  const months = monthsBetween(wizard.planningStart, wizard.planningEnd);

  const enabled = wizard.platforms.filter((p) => p.enabled);
  const totals = enabled.reduce(
    (acc, p) => {
      const a = wizard.assumptions.find((x) => x.platform === p.platform);
      if (!a) return acc;
      const f = calculateForecast(p.budget, a);
      acc.impressions += f.impressions;
      acc.clicks += f.clicks;
      acc.leads += f.leads;
      return acc;
    },
    { impressions: 0, clicks: 0, leads: 0 }
  );

  return (
    <div className="space-y-5">
      <Card accent="cyan">
        <CardHeader>
          <CardTitle>Review & confirm</CardTitle>
          <CardDescription>
            Double-check the inputs below. Generating the plan will create one forecast row per
            month, geography, and enabled platform — and route you to the plan workspace.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Plan name" value={wizard.name || "—"} />
            <Row label="Period" value={formatDateRange(wizard.planningStart, wizard.planningEnd)} />
            <Row label="Months" value={String(months.length)} />
            <Row label="Total budget" value={formatCurrency(wizard.totalBudget, wizard.currency)} />
            <Row label="Agency fee" value={`${wizard.agencyFeePct}%`} />
            <Row
              label="Net media budget"
              value={formatCurrency(netBudget, wizard.currency)}
              emphasis
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objective</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Objective"
              value={OBJECTIVES.find((o) => o.id === wizard.objective)?.label ?? wizard.objective}
            />
            <Row label="Primary KPI" value={wizard.primaryKPI} />
            {wizard.primaryKPITarget !== undefined && (
              <Row label="Target" value={String(wizard.primaryKPITarget)} />
            )}
            {wizard.secondaryKPIs.length > 0 && (
              <Row label="Secondary KPIs" value={wizard.secondaryKPIs.join(", ")} />
            )}
            <Row
              label="Funnel split"
              value={`A ${wizard.funnelSplit.awareness}% · C ${wizard.funnelSplit.consideration}% · D ${wizard.funnelSplit.decision}% · LG ${wizard.funnelSplit.lead_gen}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Geographies ({wizard.geographies.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {wizard.geographies.map((g) => (
              <div key={g.id} className="flex items-center justify-between">
                <span>{g.name}</span>
                <Badge variant="muted">{g.budgetShare.toFixed(1)}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platforms ({enabled.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {enabled.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <span>{PLATFORMS.find((x) => x.id === p.platform)?.label ?? p.platform}</span>
                <span className="text-muted-foreground">
                  {p.budgetShare.toFixed(1)}% · {formatCurrency(p.budget, wizard.currency)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card accent="purple">
        <CardHeader>
          <CardTitle className="text-base">Initial forecast preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                Impressions
              </div>
              <div className="text-2xl font-bold">{formatNumber(totals.impressions)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                Clicks
              </div>
              <div className="text-2xl font-bold">{formatNumber(totals.clicks)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                Leads
              </div>
              <div className="text-2xl font-bold">{formatNumber(totals.leads)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planning notes (optional)</CardTitle>
          <CardDescription>
            Capture rationale and context. These flow into the dashboard and the Excel export.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NoteField label="Budget rationale" value={wizard.notes.budgetRationale ?? ""} onChange={(v) => setNote("budgetRationale", v)} />
          <NoteField label="Geography rationale" value={wizard.notes.geographyRationale ?? ""} onChange={(v) => setNote("geographyRationale", v)} />
          <NoteField label="Platform rationale" value={wizard.notes.platformRationale ?? ""} onChange={(v) => setNote("platformRationale", v)} />
          <NoteField label="Assumption notes" value={wizard.notes.assumptions ?? ""} onChange={(v) => setNote("assumptions", v)} />
          <NoteField label="Internal notes" value={wizard.notes.internal ?? ""} onChange={(v) => setNote("internal", v)} />
          <NoteField label="Client notes" value={wizard.notes.client ?? ""} onChange={(v) => setNote("client", v)} />
        </CardContent>
      </Card>
    </div>
  );

  function NoteField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[60px] text-sm"
          placeholder="Optional"
        />
      </div>
    );
  }
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasis ? "font-bold text-base" : "font-semibold"}>{value}</span>
    </div>
  );
}
