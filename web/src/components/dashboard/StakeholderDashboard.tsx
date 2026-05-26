import type { MediaPlan } from "@mpa/shared";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { BudgetAllocationCharts } from "./BudgetAllocationCharts";
import { ForecastOverview } from "./ForecastOverview";
import { GeographyStrategy } from "./GeographyStrategy";
import { PlatformRole } from "./PlatformRole";
import { AIRecommendationsPlaceholder } from "./AIRecommendationsPlaceholder";
import { RisksAndWatchouts } from "./RisksAndWatchouts";

export function StakeholderDashboard({ plan }: { plan: MediaPlan }) {
  return (
    <div className="space-y-8">
      <ExecutiveSummary plan={plan} />
      <BudgetAllocationCharts plan={plan} />
      <ForecastOverview plan={plan} />
      <GeographyStrategy plan={plan} />
      <PlatformRole plan={plan} />
      <AIRecommendationsPlaceholder />
      <RisksAndWatchouts plan={plan} />
    </div>
  );
}
