import type { Currency } from "./common";
import type { ForecastAssumption, GeographyGroup, MediaPlan, Platform } from "./plan";

export interface ClientDefaults {
  preferredPlatforms: Platform[];
  preferredGeographies: GeographyGroup[];
  benchmarkOverrides: ForecastAssumption[];
}

export interface ClientWorkspace {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  currency: Currency;
  createdAt: string;
  archived: boolean;
  plans: MediaPlan[];
  defaults: ClientDefaults;
}
