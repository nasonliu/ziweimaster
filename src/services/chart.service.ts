import { buildNatalFromAdapter } from "../adapters/iztro.adapter.js";
import { PALACE_ORDER } from "../domain/constants.js";
import { getOppositePalaceId, getSanfangSizhengPalaceIds, getTrinePalaceIds } from "../domain/palace.js";
import { getTransformationsByStem } from "../domain/sihua.js";
import type { BirthInput, NatalChartResponse } from "../domain/types.js";

export function getNatalChart(input: BirthInput): NatalChartResponse {
  const adapterResult = buildNatalFromAdapter(input);
  const natalTransformations = getTransformationsByStem(adapterResult.natalYearStem, "natal");

  const oppositeMap: Record<string, string> = {};
  const trineMap: Record<string, string[]> = {};
  const sanfangSizhengMap: Record<string, string[]> = {};

  PALACE_ORDER.forEach((name, palaceId) => {
    oppositeMap[name] = PALACE_ORDER[getOppositePalaceId(palaceId)];
    trineMap[name] = getTrinePalaceIds(palaceId).map((id) => PALACE_ORDER[id]);
    sanfangSizhengMap[name] = getSanfangSizhengPalaceIds(palaceId).map((id) => PALACE_ORDER[id]);
  });

  return {
    meta: adapterResult.meta,
    palaces: adapterResult.palaces,
    sihua: {
      natalYearStem: adapterResult.natalYearStem,
      natalTransformations
    },
    relationships: {
      oppositeMap,
      trineMap,
      sanfangSizhengMap
    },
    warnings: adapterResult.warnings
  };
}
