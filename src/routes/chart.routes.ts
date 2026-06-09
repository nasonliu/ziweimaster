import type { FastifyInstance } from "fastify";
import { getPalaceIdByName } from "../domain/palace.js";
import type { BirthInput, SanfangInput } from "../domain/types.js";
import { getNatalChart } from "../services/chart.service.js";
import { getAnnualFortune, getDecades } from "../services/horoscope.service.js";
import { remapPalacesForLayer } from "../services/mapping.service.js";
import { getSanfangSizheng } from "../services/sanfang.service.js";
import { BirthInputSchema, parseBody, SanfangInputSchema } from "./schemas.js";
import { getChinaCityLibrary } from "../services/place.service.js";

export async function registerChartRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/places/china", {
    schema: {
      tags: ["places"],
      summary: "Get China prefecture-level city library"
    }
  }, async () => getChinaCityLibrary());

  app.post("/api/chart/natal", {
    schema: {
      tags: ["chart"],
      summary: "Generate natal chart JSON"
    }
  }, async (request) => {
    const input = parseBody<BirthInput>(BirthInputSchema, request.body);
    return getNatalChart(input);
  });

  app.post("/api/chart/sanfang-sizheng", {
    schema: {
      tags: ["chart"],
      summary: "Calculate sanfang-sizheng for a palace"
    }
  }, async (request) => {
    const input = parseBody<SanfangInput>(SanfangInputSchema, request.body);
    const natal = getNatalChart(input);
    const palaceId = getPalaceIdByName(input.palaceName);
    const layer = input.layer ?? "natal";

    if (layer === "decade") {
      const decade = getDecades(input)[(input.decadeIndex ?? 1) - 1];
      const decadePalaces = remapPalacesForLayer(natal.palaces, decade.palaceMapping, "decade");
      return getSanfangSizheng({ palaces: decadePalaces, palaceId, transformations: decade.transformations });
    }

    if (layer === "annual") {
      const year = input.year ?? new Date().getFullYear();
      const annual = getAnnualFortune({ ...input, year });
      const annualPalaces = remapPalacesForLayer(natal.palaces, annual.palaceMapping, "annual");
      return getSanfangSizheng({ palaces: annualPalaces, palaceId, transformations: annual.transformations });
    }

    return getSanfangSizheng({ palaces: natal.palaces, palaceId, transformations: natal.sihua.natalTransformations });
  });
}
