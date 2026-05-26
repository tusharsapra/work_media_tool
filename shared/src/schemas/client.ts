import { z } from "zod";
import {
  CurrencySchema,
  ForecastAssumptionSchema,
  GeographyGroupSchema,
  MediaPlanSchema,
  PlatformSchema,
} from "./plan";

export const ClientDefaultsSchema = z.object({
  preferredPlatforms: z.array(PlatformSchema),
  preferredGeographies: z.array(GeographyGroupSchema),
  benchmarkOverrides: z.array(ForecastAssumptionSchema),
});

export const ClientWorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  website: z.string().optional(),
  industry: z.string().optional(),
  currency: CurrencySchema,
  createdAt: z.string(),
  archived: z.boolean(),
  plans: z.array(MediaPlanSchema),
  defaults: ClientDefaultsSchema,
});
