import type { Currency } from "./common";
import type {
  ForecastAssumption,
  GeographyGroup,
  GeographyPlanType,
  MediaPlan,
  Objective,
  Platform,
} from "./plan";

export type ProjectGroup = "bajaj" | "non_bajaj";

export interface ClientDefaults {
  preferredPlatforms: Platform[];
  preferredGeographies: GeographyGroup[];
  benchmarkOverrides: ForecastAssumption[];
}

// NOTE: internally still named ClientWorkspace to avoid breaking V1 call sites.
// The UI refers to these as "Projects".
export interface ClientWorkspace {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  currency?: Currency; // optional — seed projects leave this blank; set at plan creation
  projectGroup: ProjectGroup;
  projectContext?: string;
  defaultObjective?: Objective;
  defaultGeographyType?: GeographyPlanType;
  createdAt: string;
  updatedAt?: string;
  archived: boolean;
  plans: MediaPlan[];
  defaults: ClientDefaults;
}
