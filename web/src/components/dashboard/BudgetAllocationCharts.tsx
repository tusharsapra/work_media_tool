import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { MediaPlan } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORMS } from "@/data/defaults";
import { armTheme } from "@/theme/armTheme";
import { formatCurrency, formatMonth } from "@/utils/formatters";

const platformColor = (p: keyof typeof armTheme.platformColors) =>
  armTheme.platformColors[p] ?? armTheme.colors.mutedText;

export function BudgetAllocationCharts({ plan }: { plan: MediaPlan }) {
  const byPlatform = useMemo(() => {
    const map = new Map<string, number>();
    plan.rows.forEach((r) => map.set(r.platform, (map.get(r.platform) ?? 0) + r.budget));
    return Array.from(map.entries())
      .map(([platform, value]) => ({
        platform,
        label: PLATFORMS.find((p) => p.id === platform)?.label ?? platform,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [plan.rows]);

  const byGeo = useMemo(() => {
    const map = new Map<string, { name: string; value: number }>();
    plan.rows.forEach((r) => {
      const existing = map.get(r.geographyId);
      if (existing) existing.value += r.budget;
      else map.set(r.geographyId, { name: r.geographyName, value: r.budget });
    });
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [plan.rows]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    plan.rows.forEach((r) => map.set(r.month, (map.get(r.month) ?? 0) + r.budget));
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month: formatMonth(month), value }));
  }, [plan.rows]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">
          Budget Allocation
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-bold tracking-tight mb-3">By platform</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPlatform}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={2}
                  >
                    {byPlatform.map((d) => (
                      <Cell
                        key={d.platform}
                        fill={platformColor(d.platform as keyof typeof armTheme.platformColors)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v, plan.currency)}
                    contentStyle={{ borderRadius: 12, borderColor: armTheme.colors.border }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-3">
              {byPlatform.map((d) => (
                <div key={d.platform} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: platformColor(
                        d.platform as keyof typeof armTheme.platformColors
                      ),
                    }}
                  />
                  <span className="flex-1 truncate text-muted-foreground">{d.label}</span>
                  <span className="font-semibold">
                    {formatCurrency(d.value, plan.currency)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-bold tracking-tight mb-3">By geography</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byGeo}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="50%"
                    outerRadius="80%"
                    paddingAngle={2}
                  >
                    {byGeo.map((_, i) => (
                      <Cell key={i} fill={armTheme.chartPalette[i % armTheme.chartPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v, plan.currency)}
                    contentStyle={{ borderRadius: 12, borderColor: armTheme.colors.border }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-3">
              {byGeo.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: armTheme.chartPalette[i % armTheme.chartPalette.length],
                    }}
                  />
                  <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
                  <span className="font-semibold">
                    {formatCurrency(d.value, plan.currency)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-bold tracking-tight mb-3">By month</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid stroke={armTheme.colors.border} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={armTheme.colors.mutedText} />
                  <YAxis tick={{ fontSize: 11 }} stroke={armTheme.colors.mutedText} />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v, plan.currency)}
                    contentStyle={{ borderRadius: 12, borderColor: armTheme.colors.border }}
                  />
                  <Bar dataKey="value" fill={armTheme.colors.cyan} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
