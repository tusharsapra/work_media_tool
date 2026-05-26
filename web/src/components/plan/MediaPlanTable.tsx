import { useMemo, useState } from "react";
import type { MediaPlan, Platform } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OBJECTIVES, PLATFORMS } from "@/data/defaults";
import { formatCurrency, formatNumber, formatPercent, formatMonth } from "@/utils/formatters";
import { calculatePlanTotals } from "@/utils/forecastEngine";
import { cn } from "@/lib/utils";

export function MediaPlanTable({ plan }: { plan: MediaPlan }) {
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [geoFilter, setGeoFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      plan.rows.filter(
        (r) =>
          (platformFilter === "all" || r.platform === platformFilter) &&
          (geoFilter === "all" || r.geographyId === geoFilter)
      ),
    [plan.rows, platformFilter, geoFilter]
  );
  const totals = calculatePlanTotals(filtered);

  const platformsInPlan = Array.from(new Set(plan.rows.map((r) => r.platform)));

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Monthly media plan</h2>
            <p className="text-sm text-muted-foreground">
              {plan.rows.length} forecast rows · {OBJECTIVES.find((o) => o.id === plan.objective)?.label}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip
              active={platformFilter === "all"}
              onClick={() => setPlatformFilter("all")}
              label="All platforms"
            />
            {platformsInPlan.map((p) => (
              <FilterChip
                key={p}
                active={platformFilter === p}
                onClick={() => setPlatformFilter(p)}
                label={PLATFORMS.find((x) => x.id === p)?.label ?? p}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <FilterChip
            active={geoFilter === "all"}
            onClick={() => setGeoFilter("all")}
            label="All geographies"
          />
          {plan.geographies.map((g) => (
            <FilterChip
              key={g.id}
              active={geoFilter === g.id}
              onClick={() => setGeoFilter(g.id)}
              label={g.name}
            />
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-3 py-2">Month</th>
                <th className="px-3 py-2">Geo</th>
                <th className="px-3 py-2">Platform</th>
                <th className="px-3 py-2">Funnel</th>
                <th className="px-3 py-2">Deal</th>
                <th className="px-3 py-2 text-right">Budget</th>
                <th className="px-3 py-2 text-right">Impressions</th>
                <th className="px-3 py-2 text-right">Clicks</th>
                <th className="px-3 py-2 text-right">LPVs</th>
                <th className="px-3 py-2 text-right">Leads</th>
                <th className="px-3 py-2 text-right">CTR</th>
                <th className="px-3 py-2 text-right">CPC</th>
                <th className="px-3 py-2 text-right">CPL</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/60 hover:bg-background/40">
                  <td className="px-3 py-2 whitespace-nowrap">{formatMonth(row.month)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.geographyName}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-semibold">
                    {PLATFORMS.find((p) => p.id === row.platform)?.label ?? row.platform}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">
                    {row.funnelStage.replace("_", " ")}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.dealType}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {formatCurrency(row.budget, plan.currency)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {formatNumber(row.impressions)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {formatNumber(row.clicks)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {formatNumber(row.lpvs)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {formatNumber(row.leads)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {formatPercent(row.ctr)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {formatCurrency(row.cpc, plan.currency)}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap font-semibold">
                    {formatCurrency(row.cpl, plan.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-success/10 font-bold text-sm">
                <td className="px-3 py-3" colSpan={5}>
                  TOTAL
                </td>
                <td className="px-3 py-3 text-right">{formatCurrency(totals.budget, plan.currency)}</td>
                <td className="px-3 py-3 text-right">{formatNumber(totals.impressions)}</td>
                <td className="px-3 py-3 text-right">{formatNumber(totals.clicks)}</td>
                <td className="px-3 py-3 text-right">{formatNumber(totals.lpvs)}</td>
                <td className="px-3 py-3 text-right">{formatNumber(totals.leads)}</td>
                <td className="px-3 py-3 text-right">{formatPercent(totals.blendedCTR)}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(totals.blendedCPC, plan.currency)}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(totals.blendedCPL, plan.currency)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
      <Button
        variant={active ? "primary" : "secondary"}
        size="sm"
        onClick={onClick}
        className={cn("text-xs", active ? "" : "")}
      >
        {label}
      </Button>
    );
  }
}
