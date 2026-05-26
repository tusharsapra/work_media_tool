import { useMemo } from "react";
import type { MediaPlan, Platform } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/data/defaults";
import { armTheme } from "@/theme/armTheme";
import { formatCurrency, formatNumber } from "@/utils/formatters";

const FUNNEL_LABEL: Record<string, string> = {
  awareness: "Top of funnel",
  consideration: "Mid of funnel",
  decision: "Bottom of funnel",
  lead_gen: "Lead gen",
  retention: "Retention",
};

function rationale(platform: Platform, funnel: string): string {
  if (funnel === "decision" || funnel === "lead_gen") {
    if (platform === "google_search" || platform === "bing")
      return "Captures high-intent search demand and drives bottom-funnel conversions.";
    if (platform === "linkedin")
      return "Reaches professional decision-makers with high-value targeting.";
    if (platform === "meta") return "Efficient nurture and retargeting against warm audiences.";
  }
  if (funnel === "awareness") {
    if (platform === "youtube") return "Drives brand recall and aided search lift via video.";
    if (platform === "meta") return "Efficient reach across Facebook and Instagram audiences.";
    if (platform === "tiktok") return "Reaches younger audiences with high engagement formats.";
    if (platform === "programmatic" || platform === "google_display")
      return "Scales reach across publisher inventory at low CPM.";
  }
  return "Selected for funnel coverage relevant to the objective.";
}

export function PlatformRole({ plan }: { plan: MediaPlan }) {
  const cards = useMemo(() => {
    const enabled = plan.platforms.filter((p) => p.enabled);
    return enabled.map((p) => {
      const rowsForPlatform = plan.rows.filter((r) => r.platform === p.platform);
      const leads = rowsForPlatform.reduce((s, r) => s + r.leads, 0);
      const budget = rowsForPlatform.reduce((s, r) => s + r.budget, 0);
      return {
        ...p,
        info: PLATFORMS.find((x) => x.id === p.platform),
        leads,
        budget,
      };
    });
  }, [plan]);

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
        Platform Role
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold tracking-tight">{c.info?.label ?? c.platform}</h4>
                <span
                  className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0"
                  style={{
                    backgroundColor:
                      armTheme.platformColors[c.platform as keyof typeof armTheme.platformColors] ??
                      armTheme.colors.mutedText,
                  }}
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="muted" className="capitalize">
                  {FUNNEL_LABEL[c.funnelStage]}
                </Badge>
                <Badge variant="default">{c.dealType}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {rationale(c.platform, c.funnelStage)}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Budget
                  </div>
                  <div className="font-bold">{formatCurrency(c.budget, plan.currency)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Forecast leads
                  </div>
                  <div className="font-bold">{formatNumber(c.leads)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
