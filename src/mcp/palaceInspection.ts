import { BRANCH_ATTRIBUTES, PALACE_ORDER, STEM_ATTRIBUTES } from "../domain/constants.js";
import { getOppositePalaceId, getPalaceIdByName, getTrinePalaceIds } from "../domain/palace.js";
import { getTransformationsByStem } from "../domain/sihua.js";
import type {
  AnnualInput,
  BirthInput,
  FortuneLayer,
  Palace,
  PalaceName,
  TransformationTarget
} from "../domain/types.js";
import { getNatalChart } from "../services/chart.service.js";
import { resolveTransformationTargets } from "../services/flystar.service.js";
import { getAnnualFortune, getDecades } from "../services/horoscope.service.js";
import { remapPalacesForLayer } from "../services/mapping.service.js";
import { getSanfangSizheng } from "../services/sanfang.service.js";

export type InspectPalaceInput = AnnualInput & {
  layer?: FortuneLayer;
  palaceName?: PalaceName;
  palaceId?: number;
};

function allStars(palace: Palace) {
  return [...palace.majorStars, ...palace.minorStars, ...palace.auxiliaryStars];
}

function starView(star: { name: string; brightness?: string }) {
  return {
    name: star.name,
    brightness: star.brightness,
    label: star.brightness ? `${star.name}(${star.brightness})` : star.name
  };
}

function palaceAttributes(palace: Palace) {
  const stem = palace.heavenlyStem;
  const branch = palace.earthlyBranch;
  const stemAttr = STEM_ATTRIBUTES[stem];
  const branchAttr = BRANCH_ATTRIBUTES[branch];
  return {
    heavenlyStem: stem,
    heavenlyStemYinYang: stemAttr?.yinYang,
    heavenlyStemFiveElement: stemAttr?.fiveElement,
    earthlyBranch: branch,
    earthlyBranchYinYang: branchAttr?.yinYang,
    earthlyBranchFiveElement: branchAttr?.fiveElement
  };
}

function getLayerContext(input: InspectPalaceInput) {
  const layer = input.layer ?? "natal";
  const natal = getNatalChart(input);
  const annual = getAnnualFortune(input);
  const decades = getDecades(input);
  const currentDecade = annual.currentDecade;
  const decadePalaces = remapPalacesForLayer(natal.palaces, currentDecade.palaceMapping, "decade");
  const annualPalaces = remapPalacesForLayer(natal.palaces, annual.palaceMapping, "annual");
  const palaces = layer === "decade" ? decadePalaces : layer === "annual" ? annualPalaces : natal.palaces;
  const transformations =
    layer === "decade"
      ? currentDecade.transformations
      : layer === "annual"
        ? annual.transformations
        : natal.sihua.natalTransformations;
  const transformationTargets =
    layer === "decade"
      ? currentDecade.transformationTargets
      : layer === "annual"
        ? annual.transformationTargets
        : resolveTransformationTargets({
            palaces: natal.palaces,
            transformations: natal.sihua.natalTransformations,
            layer: "natal"
          });

  return {
    layer,
    natal,
    annual,
    decades,
    currentDecade,
    palaces,
    transformations,
    transformationTargets
  };
}

function resolveSelectedPalaceId(input: InspectPalaceInput): number {
  if (typeof input.palaceId === "number") {
    return ((input.palaceId % 12) + 12) % 12;
  }
  if (input.palaceName) {
    return getPalaceIdByName(input.palaceName);
  }
  return getPalaceIdByName("命宫");
}

function overlayForNatalPalaceId(params: {
  natalPalaceId: number;
  currentDecade: ReturnType<typeof getDecades>[number];
  annual: ReturnType<typeof getAnnualFortune>;
}) {
  const decade = params.currentDecade.palaceMapping.find((item) => item.natalPalaceId === params.natalPalaceId);
  const annual = params.annual.palaceMapping.find((item) => item.natalPalaceId === params.natalPalaceId);
  return {
    natalPalaceName: PALACE_ORDER[params.natalPalaceId],
    decadePalaceName: decade?.decadePalaceName,
    annualPalaceName: annual?.annualPalaceName
  };
}

function stemTransformationsForPalace(params: {
  selected: Palace;
  natalPalaces: Palace[];
  layerPalaces: Palace[];
  layer: FortuneLayer;
}): TransformationTarget[] {
  const transformations = getTransformationsByStem(params.selected.heavenlyStem, params.layer);
  return transformations.map((transformation) => {
    const layerTarget = params.layerPalaces.find((palace) =>
      allStars(palace).some((star) => star.name === transformation.star)
    );
    const sourceNatalId = layerTarget?.palaceId ?? 0;
    const natalTarget = params.natalPalaces[sourceNatalId] ?? params.natalPalaces[0];
    const opposite = params.natalPalaces[getOppositePalaceId(natalTarget.palaceId)];
    return {
      layer: params.layer,
      sourceStem: params.selected.heavenlyStem,
      star: transformation.star,
      transformation: transformation.transformation,
      targetNatalPalace: {
        palaceName: natalTarget.name,
        palaceId: natalTarget.palaceId,
        branch: natalTarget.earthlyBranch
      },
      targetDecadePalace:
        params.layer === "decade" && layerTarget
          ? {
              palaceName: layerTarget.name,
              palaceId: layerTarget.palaceId
            }
          : undefined,
      targetAnnualPalace:
        params.layer === "annual" && layerTarget
          ? {
              palaceName: layerTarget.name,
              palaceId: layerTarget.palaceId
            }
          : undefined,
      oppositeNatalPalace: {
        palaceName: opposite.name,
        palaceId: opposite.palaceId,
        branch: opposite.earthlyBranch
      },
      notes: layerTarget ? [] : [`${transformation.star} was not found on the ${params.layer} layer palaces`]
    };
  });
}

export function inspectPalace(input: InspectPalaceInput) {
  const context = getLayerContext(input);
  const selectedPalaceId = resolveSelectedPalaceId(input);
  const selected = context.palaces[selectedPalaceId];
  const oppositeId = getOppositePalaceId(selectedPalaceId);
  const trineIds = getTrinePalaceIds(selectedPalaceId);
  const relatedIds = [selectedPalaceId, oppositeId, ...trineIds];
  const sanfangSizheng = getSanfangSizheng({
    palaces: context.palaces,
    palaceId: selectedPalaceId,
    transformations: context.transformations
  });
  const layerTargetsInSanfang = context.transformationTargets.filter((target) =>
    relatedIds.includes(target.targetNatalPalace.palaceId)
  );
  const stemTargets = stemTransformationsForPalace({
    selected,
    natalPalaces: context.natal.palaces,
    layerPalaces: context.palaces,
    layer: context.layer
  });

  return {
    input: {
      layer: context.layer,
      year: input.year,
      palaceName: input.palaceName,
      palaceId: selectedPalaceId
    },
    selectedPalace: {
      palaceId: selected.palaceId,
      name: selected.name,
      attributes: palaceAttributes(selected),
      stars: allStars(selected).map(starView)
    },
    sanfangSizheng,
    visualRelations: {
      center: selected.name,
      opposite: context.palaces[oppositeId]?.name,
      trines: trineIds.map((id) => context.palaces[id]?.name),
      lineModel: {
        solidLine: { from: selected.name, to: context.palaces[oppositeId]?.name },
        dashedLines: trineIds.map((id) => ({ from: selected.name, to: context.palaces[id]?.name }))
      }
    },
    overlays: relatedIds.map((id) =>
      overlayForNatalPalaceId({
        natalPalaceId: context.palaces[id]?.palaceId ?? id,
        currentDecade: context.currentDecade,
        annual: context.annual
      })
    ),
    layerTransformationTargetsInSanfang: layerTargetsInSanfang,
    palaceStemTransformations: {
      sourcePalaceName: selected.name,
      sourceStem: selected.heavenlyStem,
      targets: stemTargets
    },
    fullLayerPalaces: context.palaces.map((palace) => ({
      palaceId: palace.palaceId,
      name: palace.name,
      attributes: palaceAttributes(palace),
      stars: allStars(palace).map(starView),
      overlays: overlayForNatalPalaceId({
        natalPalaceId: palace.palaceId,
        currentDecade: context.currentDecade,
        annual: context.annual
      })
    })),
    warnings: [...context.natal.warnings, ...context.annual.warnings]
  };
}
