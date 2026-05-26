import type { ForecastAssumption, MediaPlan } from "@mpa/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PLATFORMS } from "@/data/defaults";
import { PLATFORM_BENCHMARKS } from "@/data/benchmarkDefaults";
import { usePlanStore } from "@/store/usePlanStore";

const platformLabel = (p: ForecastAssumption["platform"]) =>
  PLATFORMS.find((x) => x.id === p)?.label ?? p;

export function AssumptionsEditor({ plan, clientId }: { plan: MediaPlan; clientId: string }) {
  const recalc = usePlanStore((s) => s.recalcAssumption);

  const update = (a: ForecastAssumption, patch: Partial<ForecastAssumption>) => {
    recalc(clientId, plan.id, a.id, patch);
  };

  const resetRow = (a: ForecastAssumption) => {
    const b = PLATFORM_BENCHMARKS[a.platform];
    recalc(clientId, plan.id, a.id, {
      cpm: b.cpm,
      ctr: b.ctr,
      lpvRate: b.lpvRate,
      cvr: b.cvr,
      vtr: b.vtr,
      registrationRate: b.registrationRate,
      qualifiedRate: b.qualifiedRate,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight">Forecast assumptions</h2>
          <p className="text-sm text-muted-foreground">
            Edit any cell to override the benchmark. Changes propagate to all forecast rows that use
            this platform and update the dashboard immediately.
          </p>
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
                <th className="px-2"></th>
              </tr>
            </thead>
            <tbody>
              {plan.assumptions.map((a) => (
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
                      onChange={(e) => update(a, { cpm: Number(e.target.value) })}
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
                      onChange={(e) => update(a, { ctr: Number(e.target.value) })}
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
                      onChange={(e) => update(a, { lpvRate: Number(e.target.value) })}
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
                      onChange={(e) => update(a, { cvr: Number(e.target.value) })}
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
                        update(a, {
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
                        update(a, {
                          qualifiedRate: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-2">
                    <Button variant="ghost" size="sm" onClick={() => resetRow(a)}>
                      Reset
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
