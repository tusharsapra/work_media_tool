import { useMemo } from "react";
import type { MediaPlan } from "@mpa/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/data/defaults";
import { armTheme } from "@/theme/armTheme";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { FUNNEL_ROLE_LABEL, platformWhyIncluded } from "@/utils/insightEngine";

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
                  {FUNNEL_ROLE_LABEL[c.funnelStage]}
                </Badge>
                <Badge variant="default">{c.dealType}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {platformWhyIncluded(c.platform, c.funnelStage)}
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
