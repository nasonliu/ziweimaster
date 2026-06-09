import { z } from "zod";
import { PALACE_ORDER } from "../domain/constants.js";
import type { PalaceName } from "../domain/types.js";

const PalaceNameSchema: z.ZodType<PalaceName> = z.enum(PALACE_ORDER as [PalaceName, ...PalaceName[]]);

export const BirthInputSchema = z.object({
  gender: z.enum(["male", "female"]),
  birthDateTime: z.string().datetime({ offset: true }),
  calendarType: z.enum(["solar", "lunar"]),
  trueSolarTime: z.boolean().optional(),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  birthPlaceProvince: z.string().optional(),
  birthPlaceCity: z.string().optional(),
  timezone: z.string().optional(),
  name: z.string().optional(),
  locale: z.enum(["zh-CN", "zh-TW", "en"]).optional()
});

export const AnnualInputSchema = BirthInputSchema.extend({
  year: z.number().int().min(1900).max(2200)
});

export const SanfangInputSchema = BirthInputSchema.extend({
  palaceName: PalaceNameSchema,
  layer: z.enum(["natal", "decade", "annual"]).optional(),
  year: z.number().int().min(1900).max(2200).optional(),
  decadeIndex: z.number().int().min(1).max(12).optional()
});

export const AnalysisPayloadInputSchema = BirthInputSchema.extend({
  year: z.number().int().min(1900).max(2200).optional(),
  focusPalaces: z.array(PalaceNameSchema).optional(),
  includeDecade: z.boolean().optional(),
  includeAnnual: z.boolean().optional(),
  includeSanfang: z.boolean().optional(),
  includeTransformations: z.boolean().optional(),
  includeConflicts: z.boolean().optional()
});

export const AiAnalysisInputSchema = AnalysisPayloadInputSchema.extend({
  question: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000)
      })
    )
    .max(20)
    .optional(),
  layer: z.enum(["natal", "decade", "annual"]).optional(),
  palaceName: PalaceNameSchema.optional(),
  expertProfile: z.enum(["balanced", "south", "north", "sanhe", "feixing"]).optional(),
  answerStyle: z.enum(["plain", "professional", "mixed"]).optional(),
  personalContext: z.string().max(2000).optional(),
  allowFollowup: z.boolean().optional()
});

export function parseBody<T>(schema: z.ZodTypeAny, body: unknown): T {
  return schema.parse(body) as T;
}
