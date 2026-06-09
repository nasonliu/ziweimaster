import { getStemBranch } from "../adapters/iztro.adapter.js";
import { PALACE_ORDER } from "../domain/constants.js";
import { getPalaceIdByName, normalizePalaceId } from "../domain/palace.js";
import { getTransformationsByStem } from "../domain/sihua.js";
import type {
  AnnualFortune,
  AnnualInput,
  BirthInput,
  DecadeFortune,
  Palace,
  PalaceMapping,
  SanfangResult,
  Transformation,
  TripleLayerMapping
} from "../domain/types.js";
import { getNatalChart } from "./chart.service.js";
import { resolveTransformationTargets } from "./flystar.service.js";
import { getPalaceMapping, remapPalacesForLayer } from "./mapping.service.js";
import { getSanfangSizheng } from "./sanfang.service.js";

function birthYear(input: BirthInput): number {
  return new Date(input.birthDateTime).getFullYear();
}

function getAnnualMingPalaceId(year: number, palaces: Palace[]): number {
  const branch = getStemBranch(year).slice(1);
  const matched = palaces.find((palace) => palace.earthlyBranch === branch);
  return matched?.palaceId ?? normalizePalaceId(year);
}

function buildLayerSanfang(
  layerPalaces: Palace[],
  prefix: "大限" | "流年",
  transformations: Transformation[]
): Record<string, SanfangResult> {
  return Object.fromEntries(
    PALACE_ORDER.map((name, palaceId) => [
      `${prefix}${name}`,
      getSanfangSizheng({ palaces: layerPalaces, palaceId, transformations })
    ])
  );
}

function getCurrentDecadeIndex(input: BirthInput, year: number): number {
  const sui = year - birthYear(input) + 1;
  return Math.min(12, Math.max(1, Math.ceil(sui / 10)));
}

function buildTripleLayerMapping(params: {
  natalPalaces: Palace[];
  annualPalaces: Palace[];
  decadePalaces: Palace[];
  annualMapping: PalaceMapping[];
  decadeMapping: PalaceMapping[];
  natalTransformations: Transformation[];
  decadeTransformations: Transformation[];
  annualTransformations: Transformation[];
}): TripleLayerMapping[] {
  return params.annualMapping.map((annualMap, annualPalaceId) => {
    const annualName = annualMap.annualPalaceName ?? `流年${PALACE_ORDER[annualPalaceId]}`;
    const decadeMap =
      params.decadeMapping.find((item) => item.natalPalaceId === annualMap.natalPalaceId) ??
      params.decadeMapping[annualPalaceId];
    const natalPalace = params.natalPalaces[annualMap.natalPalaceId];
    const decadePalace = params.decadePalaces[getPalaceIdByName(decadeMap.decadePalaceName ?? "命宫")];
    const annualPalace = params.annualPalaces[annualPalaceId];

    return {
      annualPalaceName: annualName,
      annualPalaceId,
      mapsToNatal: {
        palaceName: natalPalace.name,
        palaceId: natalPalace.palaceId,
        branch: natalPalace.earthlyBranch
      },
      mapsToDecade: {
        palaceName: decadeMap.decadePalaceName ?? decadeMap.natalPalaceName,
        palaceId: decadeMap.natalPalaceId,
        branch: decadeMap.branch
      },
      stars: {
        natalStars: [...natalPalace.majorStars, ...natalPalace.minorStars, ...natalPalace.auxiliaryStars],
        decadeStars: [...decadePalace.majorStars, ...decadePalace.minorStars, ...decadePalace.auxiliaryStars],
        annualStars: [...annualPalace.majorStars, ...annualPalace.minorStars, ...annualPalace.auxiliaryStars]
      },
      transformations: {
        natal: params.natalTransformations.filter((item) =>
          natalPalace.majorStars.some((star) => star.name === item.star)
        ),
        decade: params.decadeTransformations.filter((item) =>
          natalPalace.majorStars.some((star) => star.name === item.star)
        ),
        annual: params.annualTransformations.filter((item) =>
          natalPalace.majorStars.some((star) => star.name === item.star)
        )
      }
    };
  });
}

export function getDecades(input: BirthInput): DecadeFortune[] {
  const natal = getNatalChart(input);
  const baseYear = birthYear(input);

  return Array.from({ length: 12 }, (_, offset) => {
    const index = offset + 1;
    const ageStart = (index - 1) * 10 + 4;
    const ageEnd = ageStart + 9;
    const yearStart = baseYear + ageStart - 1;
    const yearEnd = baseYear + ageEnd - 1;
    const targetMingPalaceId = normalizePalaceId(index - 1);
    const mapping = getPalaceMapping({
      basePalaces: natal.palaces,
      targetMingPalaceId,
      layer: "decade"
    });
    const layerPalaces = remapPalacesForLayer(natal.palaces, mapping, "decade");
    const stemBranch = getStemBranch(yearStart);
    const transformations = getTransformationsByStem(stemBranch[0], "decade");
    const transformationTargets = resolveTransformationTargets({
      palaces: natal.palaces,
      transformations,
      layer: "decade",
      decadeMapping: mapping
    });

    return {
      index,
      ageRange: [ageStart, ageEnd],
      yearRange: [yearStart, yearEnd],
      decadeStemBranch: stemBranch,
      decadeMingPalace: {
        natalPalaceName: natal.palaces[targetMingPalaceId].name,
        palaceId: targetMingPalaceId,
        branch: natal.palaces[targetMingPalaceId].earthlyBranch
      },
      palaceMapping: mapping,
      transformations,
      transformationTargets,
      sanfangSizheng: buildLayerSanfang(layerPalaces, "大限", transformations),
      warnings: natal.warnings
    };
  });
}

export function getAnnualFortune(input: AnnualInput): AnnualFortune {
  const natal = getNatalChart(input);
  const decades = getDecades(input);
  const currentDecade = decades[getCurrentDecadeIndex(input, input.year) - 1];
  const stemBranch = getStemBranch(input.year);
  const targetMingPalaceId = getAnnualMingPalaceId(input.year, natal.palaces);
  const annualMapping = getPalaceMapping({
    basePalaces: natal.palaces,
    targetMingPalaceId,
    layer: "annual"
  });
  const annualPalaces = remapPalacesForLayer(natal.palaces, annualMapping, "annual");
  const decadePalaces = remapPalacesForLayer(natal.palaces, currentDecade.palaceMapping, "decade");
  const transformations = getTransformationsByStem(stemBranch[0], "annual");
  const transformationTargets = resolveTransformationTargets({
    palaces: natal.palaces,
    transformations,
    layer: "annual",
    decadeMapping: currentDecade.palaceMapping,
    annualMapping
  });

  return {
    year: input.year,
    sui: input.year - birthYear(input) + 1,
    stemBranch,
    annualMingPalace: {
      natalPalaceName: natal.palaces[targetMingPalaceId].name,
      palaceId: targetMingPalaceId,
      branch: natal.palaces[targetMingPalaceId].earthlyBranch
    },
    palaceMapping: annualMapping,
    transformations,
    transformationTargets,
    sanfangSizheng: buildLayerSanfang(annualPalaces, "流年", transformations),
    currentDecade,
    tripleLayerMapping: buildTripleLayerMapping({
      natalPalaces: natal.palaces,
      annualPalaces,
      decadePalaces,
      annualMapping,
      decadeMapping: currentDecade.palaceMapping,
      natalTransformations: natal.sihua.natalTransformations,
      decadeTransformations: currentDecade.transformations,
      annualTransformations: transformations
    }),
    warnings: [...natal.warnings, ...currentDecade.warnings]
  };
}
