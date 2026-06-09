import { getOppositePalaceId, getSanfangSizhengPalaceIds, getTrinePalaceIds } from "../domain/palace.js";
import type { Palace, SanfangResult, Star, Transformation } from "../domain/types.js";

function collectStars(palace: Palace): Star[] {
  return [...palace.majorStars, ...palace.minorStars, ...palace.auxiliaryStars];
}

export function getSanfangSizheng(params: {
  palaces: Palace[];
  palaceId: number;
  transformations?: Transformation[];
}): SanfangResult {
  const center = params.palaces[params.palaceId];
  if (!center) {
    throw new Error(`Unknown palace id: ${params.palaceId}`);
  }

  const oppositeId = getOppositePalaceId(params.palaceId);
  const trineIds = getTrinePalaceIds(params.palaceId);
  const allIds = getSanfangSizhengPalaceIds(params.palaceId);
  const transformations = params.transformations ?? [];

  const allPalaces = allIds.map((palaceId) => {
    const palace = params.palaces[palaceId];
    const role: "center" | "opposite" | "trine" =
      palaceId === params.palaceId ? "center" : palaceId === oppositeId ? "opposite" : "trine";
    return {
      palaceName: palace.name,
      palaceId,
      role,
      stars: collectStars(palace),
      transformations: transformations.filter((item) =>
        collectStars(palace).some((star) => star.name === item.star)
      )
    };
  });

  const starNames = [...new Set(allPalaces.flatMap((item) => item.stars.map((star) => star.name)))];
  const transformationSummary = allPalaces.flatMap((item) =>
    item.transformations.map((transform) => `${item.palaceName}:${transform.star}${transform.transformation}`)
  );

  return {
    center: {
      palaceName: center.name,
      palaceId: params.palaceId,
      branch: center.earthlyBranch,
      stars: collectStars(center)
    },
    opposite: {
      palaceName: params.palaces[oppositeId].name,
      palaceId: oppositeId,
      branch: params.palaces[oppositeId].earthlyBranch,
      stars: collectStars(params.palaces[oppositeId])
    },
    trines: trineIds.map((palaceId) => ({
      palaceName: params.palaces[palaceId].name,
      palaceId,
      branch: params.palaces[palaceId].earthlyBranch,
      stars: collectStars(params.palaces[palaceId])
    })),
    allPalaces,
    summaryForLLM: {
      starNames,
      transformationSummary,
      warnings: []
    }
  };
}
