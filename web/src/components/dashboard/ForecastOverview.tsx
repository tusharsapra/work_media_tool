import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MediaPlan } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORMS } from "@/data/defaults";
import { armTheme } from "@/theme/armTheme";
import { formatCurrency, formatNumber } from "@/utils/formatters";

export function ForecastOverview({ plan }: { plan: MediaPlan }) {
  const data = useMemo(() => {
    const map = new Map<string, { platform: string; budget: number; leads: number }>();
    plan.rows.forEach((r) => {
      const existing = map.get(r.platform);
      if (existing) {
        existing.budget += r.budget;
        existing.leads += r.leads;
      } else {
        map.set(r.platform, {
          platform: PLATFORMS.find((p) => p.id === r.platform)?.label ?? r.platform,
          budget: r.budget,
          leads: r.leads,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.budget - a.budget);
  }, [plan.rows]);

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
        Forecast Overview
      </div>
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-bold tracking-tight mb-3">Budget vs leads by platform</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid stroke={armTheme.colors.border} vertical={false} />
                <XAxis
                  dataKey="platform"
                  tick={{ fontSize: 11 }}
                  stroke={armTheme.colors.mutedText}
                  interval={0}
                  angle={-15}
                  height={50}
                  textAnchor="end"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  stroke={armTheme.colors.mutedText}
                  tickFormatter={(v) =>
                    typeof v === "number" && v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  stroke={armTheme.colors.mutedText}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: armTheme.colors.border }}
                  formatter={(value: number, name: string) => {
                    if (name === "Budget") return [formatCurrency(value, plan.currency), name];
                    return [formatNumber(value), name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="left"
                  dataKey="budget"
                  name="Budget"
                  fill={armTheme.colors.cyan}
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="leads"
                  name="Leads"
                  stroke={armTheme.colors.purple}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: armTheme.colors.purple }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
