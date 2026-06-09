import type { FastifyInstance } from "fastify";
import type { AnnualInput, BirthInput } from "../domain/types.js";
import { getAnnualFortune, getDecades } from "../services/horoscope.service.js";
import { getNatalChart } from "../services/chart.service.js";
import { resolveTransformationTargets, detectTransformationConflicts } from "../services/flystar.service.js";
import { AnnualInputSchema, BirthInputSchema, parseBody } from "./schemas.js";

export async function registerFortuneRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/fortune/decades", {
    schema: {
      tags: ["fortune"],
      summary: "Generate twelve decade fortune records"
    }
  }, async (request) => {
    const input = parseBody<BirthInput>(BirthInputSchema, request.body);
    return { decades: getDecades(input) };
  });

  app.post("/api/fortune/annual", {
    schema: {
      tags: ["fortune"],
      summary: "Generate annual fortune JSON"
    }
  }, async (request) => {
    const input = parseBody<AnnualInput>(AnnualInputSchema, request.body);
    return getAnnualFortune(input);
  });

  app.post("/api/fortune/transformations", {
    schema: {
      tags: ["fortune"],
      summary: "Generate combined natal, decade, and annual transformation targets"
    }
  }, async (request) => {
    const input = parseBody<AnnualInput>(AnnualInputSchema, request.body);
    const natal = getNatalChart(input);
    const annual = getAnnualFortune(input);
    const natalTargets = resolveTransformationTargets({
      palaces: natal.palaces,
      transformations: natal.sihua.natalTransformations,
      layer: "natal"
    });
    return {
      natal: natalTargets,
      decade: annual.currentDecade.transformationTargets,
      annual: annual.transformationTargets,
      conflicts: detectTransformationConflicts({
        natalTargets,
        decadeTargets: annual.currentDecade.transformationTargets,
        annualTargets: annual.transformationTargets
      }),
      warnings: annual.warnings
    };
  });
}
