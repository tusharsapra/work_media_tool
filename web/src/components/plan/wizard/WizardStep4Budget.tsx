import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/data/defaults";
import { usePlanStore, makePlatformPlan } from "@/store/usePlanStore";
import { recommendAllocation } from "@/utils/allocationEngine";
import { validateWizardStep4 } from "@/utils/validationEngine";
import { generateBudgetWarnings } from "@/utils/forecastEngine";
import { formatCurrency, monthsBetween } from "@/utils/formatters";
import { ValidationIssues } from "./ValidationIssues";
import type { DealType, FunnelStage, Platform, PlatformPlan } from "@mpa/shared";

export function WizardStep4Budget() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);
  const clients = usePlanStore((s) => s.clients);
  const industry = clients.find((c) => c.id === wizard.clientId)?.industry;

  const netBudget = wizard.totalBudget * (1 - wizard.agencyFeePct / 100);

  // Initialize platforms once (auto-recommend allocation based on objective + enabled set).
  useEffect(() => {
    if (wizard.platforms.length === 0) {
      const defaults: PlatformPlan[] = ["meta", "google_search", "linkedin", "google_demand_gen", "youtube"].map(
        (p) => {
          const info = PLATFORMS.find((x) => x.id === p)!;
          return makePlatformPlan({
            platform: p as Platform,
            funnelStage: info.defaultFunnelStage,
            dealType: info.defaultDealType,
            enabled: false,
            budgetShare: 0,
            budget: 0,
          });
        }
      );
      setField("platforms", defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enabled = useMemo(() => wizard.platforms.filter((p) => p.enabled), [wizard.platforms]);
  const totalShare = enabled.reduce((s, p) => s + (p.budgetShare || 0), 0);

  const togglePlatform = (id: string, on: boolean) => {
    setField(
      "platforms",
      wizard.platforms.map((p) =>
        p.id === id
          ? { ...p, enabled: on, budgetShare: on ? p.budgetShare : 0, budget: on ? p.budget : 0 }
          : p
      )
    );
  };

  const updatePlatform = (id: string, patch: Partial<PlatformPlan>) => {
    setField(
      "platforms",
      wizard.platforms.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        if (patch.budgetShare !== undefined) next.budget = (netBudget * patch.budgetShare) / 100;
        return next;
      })
    );
  };

  const addPlatform = (platform: Platform) => {
    if (wizard.platforms.some((p) => p.platform === platform)) return;
    const info = PLATFORMS.find((x) => x.id === platform)!;
    setField("platforms", [
      ...wizard.platforms,
      makePlatformPlan({
        platform,
        funnelStage: info.defaultFunnelStage,
        dealType: info.defaultDealType,
        enabled: true,
        budgetShare: 0,
        budget: 0,
      }),
    ]);
  };

  const autoAllocate = () => {
    const enabledIds = wizard.platforms.filter((p) => p.enabled).map((p) => p.platform);
    if (enabledIds.length === 0) return;
    const recs = recommendAllocation(wizard.objective, enabledIds, industry);
    const next = wizard.platforms.map((p) => {
      const rec = recs.find((r) => r.platform === p.platform);
      if (!rec) return p;
      return {
        ...p,
        budgetShare: Number(rec.budgetShare.toFixed(2)),
        budget: (netBudget * rec.budgetShare) / 100,
      };
    });
    setField("platforms", next);
  };

  const monthCount = monthsBetween(wizard.planningStart, wizard.planningEnd).length;
  const warnings = generateBudgetWarnings(netBudget, enabled.length, wizard.geographies.length, monthCount);
  const issues = validateWizardStep4(wizard);

  const platformsToAdd = PLATFORMS.filter((p) => !wizard.platforms.some((x) => x.platform === p.id));

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Budget framework & platforms</CardTitle>
        <CardDescription>
          Choose enabled platforms, set funnel role / deal type, and split the net media budget
          across them. Use "Auto-allocate" for a recommendation tuned to your objective and industry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background rounded-[12px] p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
              Net media budget
            </div>
            <div className="text-xl font-bold">{formatCurrency(netBudget, wizard.currency)}</div>
          </div>
          <div className="bg-background rounded-[12px] p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
              Duration
            </div>
            <div className="text-xl font-bold">
              {monthCount} {monthCount === 1 ? "month" : "months"}
            </div>
          </div>
          <div className="bg-background rounded-[12px] p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
              Enabled platforms
            </div>
            <div className="text-xl font-bold">{enabled.length}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <Select value="" onValueChange={(v) => addPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue placeholder="Add another platform…" />
              </SelectTrigger>
              <SelectContent>
                {platformsToAdd.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="accent" size="sm" onClick={autoAllocate}>
            Auto-allocate
          </Button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[36px_1fr_120px_140px_120px_140px] gap-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span />
            <span>Platform</span>
            <span>Funnel</span>
            <span>Deal type</span>
            <span>Share %</span>
            <span>Budget</span>
          </div>
          {wizard.platforms.map((p) => {
            const info = PLATFORMS.find((x) => x.id === p.platform);
            return (
              <div
                key={p.id}
                className="grid grid-cols-[36px_1fr_120px_140px_120px_140px] gap-2 items-center"
              >
                <Switch
                  checked={p.enabled}
                  onCheckedChange={(c) => togglePlatform(p.id, c === true)}
                />
                <div className="text-sm font-semibold truncate">{info?.label ?? p.platform}</div>
                <Select
                  value={p.funnelStage}
                  onValueChange={(v) => updatePlatform(p.id, { funnelStage: v as FunnelStage })}
                  disabled={!p.enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="consideration">Consideration</SelectItem>
                    <SelectItem value="decision">Decision</SelectItem>
                    <SelectItem value="lead_gen">Lead gen</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={p.dealType}
                  onValueChange={(v) => updatePlatform(p.id, { dealType: v as DealType })}
                  disabled={!p.enabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPM">CPM</SelectItem>
                    <SelectItem value="CPC">CPC</SelectItem>
                    <SelectItem value="CPV">CPV</SelectItem>
                    <SelectItem value="CPL">CPL</SelectItem>
                    <SelectItem value="CPR">CPR</SelectItem>
                    <SelectItem value="CPLPV">CPLPV</SelectItem>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={p.budgetShare || 0}
                  onChange={(e) =>
                    updatePlatform(p.id, { budgetShare: Number(e.target.value) })
                  }
                  disabled={!p.enabled}
                />
                <div className="text-sm font-semibold text-right pr-2">
                  {p.enabled ? formatCurrency(p.budget, wizard.currency) : "—"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between bg-background rounded-[12px] p-3">
          <span className="text-sm font-semibold text-muted-foreground">Total share</span>
          <Badge variant={Math.abs(totalShare - 100) < 0.5 ? "success" : "warning"}>
            {totalShare.toFixed(1)}% / 100%
          </Badge>
        </div>

        <ValidationIssues issues={[...issues, ...warnings.map((w) => ({ code: w.code, severity: w.severity, message: w.message }))]} />
      </CardContent>
    </Card>
  );
}
