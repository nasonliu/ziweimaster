import { PALACE_ORDER } from "../domain/constants.js";
import { normalizePalaceId } from "../domain/palace.js";
import type { FortuneLayer, Palace, PalaceMapping } from "../domain/types.js";

export function getPalaceMapping(params: {
  basePalaces: Palace[];
  targetMingPalaceId: number;
  layer: Extract<FortuneLayer, "decade" | "annual">;
}): PalaceMapping[] {
  const prefix = params.layer === "decade" ? "大限" : "流年";
  const key = params.layer === "decade" ? "decadePalaceName" : "annualPalaceName";

  return PALACE_ORDER.map((palaceName, index) => {
    const natalPalaceId = normalizePalaceId(params.targetMingPalaceId + index);
    const natalPalace = params.basePalaces[natalPalaceId];
    return {
      [key]: `${prefix}${palaceName}`,
      natalPalaceName: natalPalace.name,
      natalPalaceId,
      branch: natalPalace.earthlyBranch
    } as PalaceMapping;
  });
}

export function remapPalacesForLayer(
  basePalaces: Palace[],
  mapping: PalaceMapping[],
  layer: Extract<FortuneLayer, "decade" | "annual">
): Palace[] {
  const prefix = layer === "decade" ? "大限" : "流年";
  const nameKey = layer === "decade" ? "decadePalaceName" : "annualPalaceName";

  return mapping.map((item, palaceId) => {
    const source = basePalaces[item.natalPalaceId];
    return {
      ...source,
      palaceId,
      name: (item[nameKey] ?? `${prefix}${PALACE_ORDER[palaceId]}`) as string,
      isMingPalace: palaceId === 0,
      isBodyPalace: false
    };
  });
}
