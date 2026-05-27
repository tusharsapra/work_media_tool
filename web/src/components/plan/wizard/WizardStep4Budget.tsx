import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, MessageSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import { PLATFORMS } from "@/data/defaults";
import { usePlanStore, makePlatformPlan } from "@/store/usePlanStore";
import { recommendAllocation } from "@/utils/allocationEngine";
import { validateWizardStep4 } from "@/utils/validationEngine";
import { generateBudgetWarnings } from "@/utils/forecastEngine";
import { formatCurrency, monthsBetween } from "@/utils/formatters";
import { normalizeShares, equalShares, setShareAndRedistribute, sharesTotal } from "@/utils/shareUtils";
import { cn, safeDivide } from "@/lib/utils";
import { ValidationIssues } from "./ValidationIssues";
import type { DealType, FunnelStage, Platform, PlatformPlan } from "@mpa/shared";

export function WizardStep4Budget() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);
  const clients = usePlanStore((s) => s.clients);
  const industry = clients.find((c) => c.id === wizard.clientId)?.industry;
  const [notesOpen, setNotesOpen] = useState<string | null>(null);

  const netBudget = wizard.totalBudget;

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
  const totalShare = sharesTotal(enabled.map((p) => ({ share: p.budgetShare })));

  const withDerivedBudgets = (platforms: PlatformPlan[]): PlatformPlan[] =>
    platforms.map((p) => ({ ...p, budget: (netBudget * p.budgetShare) / 100 }));

  const setPlatforms = (next: PlatformPlan[]) => setField("platforms", next);

  const togglePlatform = (id: string, on: boolean) =>
    setPlatforms(
      wizard.platforms.map((p) =>
        p.id === id
          ? { ...p, enabled: on, budgetShare: on ? p.budgetShare : 0, budget: on ? p.budget : 0, budgetLocked: on ? p.budgetLocked : false }
          : p
      )
    );

  const updatePlatform = (id: string, patch: Partial<PlatformPlan>) =>
    setPlatforms(wizard.platforms.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  // Bidirectional editing: editing share redistributes across enabled+unlocked; editing budget
  // converts to a share then redistributes.
  const enabledIndex = (id: string) => enabled.findIndex((p) => p.id === id);

  const applyEnabledShares = (shares: number[]) => {
    let i = 0;
    const next = wizard.platforms.map((p) => {
      if (!p.enabled) return p;
      const share = shares[i++];
      return { ...p, budgetShare: share, budget: (netBudget * share) / 100 };
    });
    setPlatforms(next);
  };

  const changeShare = (id: string, value: number) => {
    const idx = enabledIndex(id);
    if (idx < 0) return;
    const shares = setShareAndRedistribute(
      enabled.map((p) => ({ share: p.budgetShare, locked: p.budgetLocked })),
      idx,
      value
    );
    applyEnabledShares(shares);
  };

  const changeBudget = (id: string, budgetValue: number) => {
    const share = safeDivide(budgetValue, netBudget) * 100;
    changeShare(id, share);
  };

  const normalize = () =>
    applyEnabledShares(normalizeShares(enabled.map((p) => ({ share: p.budgetShare, locked: p.budgetLocked }))));
  const equalSplit = () => applyEnabledShares(equalShares(enabled.length));
  const toggleLock = (id: string) =>
    updatePlatform(id, { budgetLocked: !wizard.platforms.find((p) => p.id === id)?.budgetLocked });

  const addPlatform = (platform: Platform) => {
    if (wizard.platforms.some((p) => p.platform === platform)) return;
    const info = PLATFORMS.find((x) => x.id === platform)!;
    setPlatforms([
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

  const recommendedSplit = () => {
    const enabledIds = enabled.map((p) => p.platform);
    if (enabledIds.length === 0) return;
    const recs = recommendAllocation(wizard.objective, enabledIds, industry);
    setPlatforms(
      withDerivedBudgets(
        wizard.platforms.map((p) => {
          const rec = recs.find((r) => r.platform === p.platform);
          return rec && p.enabled ? { ...p, budgetShare: Number(rec.budgetShare.toFixed(1)) } : p;
        })
      )
    );
  };

  const monthCount = monthsBetween(wizard.planningStart, wizard.planningEnd).length;
  const warnings = generateBudgetWarnings(netBudget, enabled.length, wizard.geographies.length, monthCount);
  const issues = validateWizardStep4(wizard);
  const platformsToAdd = PLATFORMS.filter((p) => !wizard.platforms.some((x) => x.platform === p.id));

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Budget & platforms</CardTitle>
        <CardDescription>
          Turn on platforms, set funnel role and deal type, then split the media budget. Edit either
          the share % or the budget — the other updates automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Media budget" value={formatCurrency(netBudget, wizard.currency)} />
          <Stat label="Duration" value={`${monthCount} ${monthCount === 1 ? "month" : "months"}`} />
          <Stat label="Enabled platforms" value={String(enabled.length)} />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={equalSplit} disabled={enabled.length === 0}>
              Equal split
            </Button>
            <Button variant="ghost" size="sm" onClick={recommendedSplit} disabled={enabled.length === 0}>
              Recommended
            </Button>
            <Button variant="ghost" size="sm" onClick={normalize} disabled={enabled.length === 0}>
              Normalize to 100%
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[36px_1fr_120px_110px_110px_150px_72px] gap-2 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span />
            <span>Platform</span>
            <span>Funnel</span>
            <span>Deal</span>
            <span>Share %</span>
            <span>Budget</span>
            <span />
          </div>
          {wizard.platforms.map((p) => {
            const info = PLATFORMS.find((x) => x.id === p.platform);
            return (
              <div key={p.id} className="space-y-2">
                <div className="grid grid-cols-[36px_1fr_120px_110px_110px_150px_72px] gap-2 items-center">
                  <Switch checked={p.enabled} onCheckedChange={(c) => togglePlatform(p.id, c === true)} />
                  <div className="text-sm font-semibold truncate">{info?.label ?? p.platform}</div>
                  <Select
                    value={p.funnelStage}
                    onValueChange={(v) => updatePlatform(p.id, { funnelStage: v as FunnelStage })}
                    disabled={!p.enabled}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    onChange={(e) => changeShare(p.id, Number(e.target.value))}
                    disabled={!p.enabled}
                  />
                  <FormattedNumberInput
                    value={p.budget}
                    currency={wizard.currency}
                    onValueChange={(v) => changeBudget(p.id, v)}
                    disabled={!p.enabled}
                  />
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={p.budgetLocked ? "Unlock" : "Lock"}
                      onClick={() => toggleLock(p.id)}
                      disabled={!p.enabled}
                    >
                      {p.budgetLocked ? (
                        <Lock className="h-4 w-4 text-primary" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Notes"
                      onClick={() => setNotesOpen(notesOpen === p.id ? null : p.id)}
                      disabled={!p.enabled}
                    >
                      <MessageSquare
                        className={cn("h-4 w-4", p.notes ? "text-primary" : "text-muted-foreground")}
                      />
                    </Button>
                  </div>
                </div>
                {notesOpen === p.id && p.enabled && (
                  <Textarea
                    value={p.notes ?? ""}
                    onChange={(e) => updatePlatform(p.id, { notes: e.target.value })}
                    placeholder={`Notes for ${info?.label ?? p.platform} (targeting, rationale, deal terms)…`}
                    className="min-h-[44px] text-sm ml-9"
                  />
                )}
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

        <ValidationIssues
          issues={[...issues, ...warnings.map((w) => ({ code: w.code, severity: w.severity, message: w.message }))]}
        />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-[12px] p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
        {label}
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
