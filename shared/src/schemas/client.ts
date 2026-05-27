import { z } from "zod";
import {
  CurrencySchema,
  ForecastAssumptionSchema,
  GeographyGroupSchema,
  GeographyPlanTypeSchema,
  MediaPlanSchema,
  ObjectiveSchema,
  PlatformSchema,
} from "./plan";

export const ProjectGroupSchema = z.enum(["bajaj", "non_bajaj"]);

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
  currency: CurrencySchema.optional(),
  projectGroup: ProjectGroupSchema,
  projectContext: z.string().optional(),
  defaultObjective: ObjectiveSchema.optional(),
  defaultGeographyType: GeographyPlanTypeSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  archived: z.boolean(),
  plans: z.array(MediaPlanSchema),
  defaults: ClientDefaultsSchema,
});
