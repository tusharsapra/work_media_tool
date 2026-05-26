import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_BENCHMARKS } from "@/data/benchmarkDefaults";
import { PLATFORMS } from "@/data/defaults";
import { usePlanStore } from "@/store/usePlanStore";
import { validateWizardStep5 } from "@/utils/validationEngine";
import { ValidationIssues } from "./ValidationIssues";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/formatters";
import { calculateForecast } from "@/utils/forecastEngine";
import { uid } from "@/lib/utils";
import type { ForecastAssumption, Platform } from "@mpa/shared";

const platformLabel = (p: Platform) => PLATFORMS.find((x) => x.id === p)?.label ?? p;

export function WizardStep5Assumptions() {
  const wizard = usePlanStore((s) => s.wizard);
  const setField = usePlanStore((s) => s.setWizardField);

  // Initialize an assumption row per enabled platform (geography-agnostic in Phase 1).
  useEffect(() => {
    const enabled = wizard.platforms.filter((p) => p.enabled);
    if (wizard.assumptions.length === 0 && enabled.length > 0) {
      const assumptions: ForecastAssumption[] = enabled.map((p) => {
        const b = PLATFORM_BENCHMARKS[p.platform];
        return {
          id: uid("asm"),
          platform: p.platform,
          cpm: b.cpm,
          ctr: b.ctr,
          lpvRate: b.lpvRate,
          cvr: b.cvr,
          vtr: b.vtr,
          registrationRate: b.registrationRate,
          qualifiedRate: b.qualifiedRate,
          source: "benchmark",
        };
      });
      setField("assumptions", assumptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAssumption = (id: string, patch: Partial<ForecastAssumption>) => {
    setField(
      "assumptions",
      wizard.assumptions.map((a) =>
        a.id === id ? { ...a, ...patch, source: "user_override" } : a
      )
    );
  };

  const resetToBenchmarks = () => {
    const benchmarked: ForecastAssumption[] = wizard.assumptions.map((a) => {
      const b = PLATFORM_BENCHMARKS[a.platform];
      return {
        ...a,
        cpm: b.cpm,
        ctr: b.ctr,
        lpvRate: b.lpvRate,
        cvr: b.cvr,
        vtr: b.vtr,
        registrationRate: b.registrationRate,
        qualifiedRate: b.qualifiedRate,
        source: "benchmark",
      };
    });
    setField("assumptions", benchmarked);
  };

  const totals = useMemo(() => {
    let impressions = 0,
      clicks = 0,
      lpvs = 0,
      leads = 0;
    wizard.assumptions.forEach((a) => {
      const plat = wizard.platforms.find((p) => p.platform === a.platform && p.enabled);
      if (!plat) return;
      const f = calculateForecast(plat.budget, a);
      impressions += f.impressions;
      clicks += f.clicks;
      lpvs += f.lpvs;
      leads += f.leads;
    });
    const totalBudget = wizard.platforms.filter((p) => p.enabled).reduce((s, p) => s + p.budget, 0);
    const blendedCPL = leads > 0 ? totalBudget / leads : 0;
    return { impressions, clicks, lpvs, leads, totalBudget, blendedCPL };
  }, [wizard.assumptions, wizard.platforms]);

  const issues = validateWizardStep5(wizard);

  return (
    <Card accent="cyan">
      <CardHeader>
        <CardTitle>Forecast assumptions</CardTitle>
        <CardDescription>
          Review the benchmark assumptions per platform. Edit any cell to override — your changes
          flip the source flag and are reflected in the live forecast below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={resetToBenchmarks}>
            Reset to benchmarks
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-2">Platform</th>
                <th className="px-2">Source</th>
                <th className="px-2">CPM</th>
                <th className="px-2">CTR</th>
                <th className="px-2">LPV%</th>
                <th className="px-2">CVR</th>
                <th className="px-2">Reg. rate</th>
                <th className="px-2">QL rate</th>
              </tr>
            </thead>
            <tbody>
              {wizard.assumptions.map((a) => (
                <tr key={a.id} className="bg-background rounded-[8px]">
                  <td className="px-2 py-2 font-semibold">{platformLabel(a.platform)}</td>
                  <td className="px-2 py-2">
                    <Badge variant={a.source === "user_override" ? "primary" : "muted"}>
                      {a.source === "user_override" ? "Override" : "Benchmark"}
                    </Badge>
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-8 w-20"
                      type="number"
                      min={0}
                      step={0.5}
                      value={a.cpm}
                      onChange={(e) => updateAssumption(a.id, { cpm: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-8 w-20"
                      type="number"
                      min={0}
                      max={1}
                      step={0.001}
                      value={a.ctr}
                      onChange={(e) => updateAssumption(a.id, { ctr: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-8 w-20"
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={a.lpvRate}
                      onChange={(e) => updateAssumption(a.id, { lpvRate: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-8 w-20"
                      type="number"
                      min={0}
                      max={1}
                      step={0.001}
                      value={a.cvr}
                      onChange={(e) => updateAssumption(a.id, { cvr: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-8 w-20"
                      type="number"
                      min={0}
                      max={1}
                      step={0.001}
                      value={a.registrationRate ?? ""}
                      onChange={(e) =>
                        updateAssumption(a.id, {
                          registrationRate: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      className="h-8 w-20"
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={a.qualifiedRate ?? ""}
                      onChange={(e) =>
                        updateAssumption(a.id, {
                          qualifiedRate: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-background rounded-[12px] p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">
            Live forecast preview
          </div>
          <div className="grid grid-cols-5 gap-4">
            <PreviewMetric label="Impressions" value={formatNumber(totals.impressions)} />
            <PreviewMetric label="Clicks" value={formatNumber(totals.clicks)} />
            <PreviewMetric label="LPVs" value={formatNumber(totals.lpvs)} />
            <PreviewMetric label="Leads" value={formatNumber(totals.leads)} />
            <PreviewMetric
              label="Blended CPL"
              value={formatCurrency(totals.blendedCPL, wizard.currency)}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-3">
            Forecast totals based on {formatCurrency(totals.totalBudget, wizard.currency)} net
            media budget across enabled platforms.{" "}
            {wizard.assumptions.length > 0 && (
              <>Blended CTR: {formatPercent(totals.clicks / Math.max(totals.impressions, 1))}.</>
            )}
          </div>
        </div>

        <ValidationIssues issues={issues} />
      </CardContent>
    </Card>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
        {label}
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
