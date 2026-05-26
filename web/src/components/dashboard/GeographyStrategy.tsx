import { useMemo } from "react";
import type { MediaPlan } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculatePlanTotals } from "@/utils/forecastEngine";
import { formatCurrency, formatNumber } from "@/utils/formatters";

export function GeographyStrategy({ plan }: { plan: MediaPlan }) {
  const rows = useMemo(() => {
    return plan.geographies.map((g) => {
      const rowsInGeo = plan.rows.filter((r) => r.geographyId === g.id);
      const t = calculatePlanTotals(rowsInGeo);
      return {
        id: g.id,
        name: g.name,
        share: g.budgetShare,
        priority: g.priority ?? "medium",
        budget: t.budget,
        leads: t.leads,
        cpl: t.blendedCPL,
      };
    });
  }, [plan]);

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
        Geography Strategy
      </div>
      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-2">Region</th>
                <th className="px-3 py-2 text-right">Share</th>
                <th className="px-3 py-2 text-right">Budget</th>
                <th className="px-3 py-2 text-right">Expected leads</th>
                <th className="px-3 py-2 text-right">Expected CPL</th>
                <th className="px-3 py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-3 py-2 font-semibold">{r.name}</td>
                  <td className="px-3 py-2 text-right">{r.share.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(r.budget, plan.currency)}</td>
                  <td className="px-3 py-2 text-right">{formatNumber(r.leads)}</td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {formatCurrency(r.cpl, plan.currency)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        r.priority === "high"
                          ? "success"
                          : r.priority === "low"
                            ? "muted"
                            : "warning"
                      }
                      className="capitalize"
                    >
                      {r.priority}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
