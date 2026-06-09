import { getOppositePalaceId } from "../domain/palace.js";
import type {
  FortuneLayer,
  Palace,
  PalaceMapping,
  Transformation,
  TransformationConflict,
  TransformationTarget
} from "../domain/types.js";

function allStarNames(palace: Palace): string[] {
  return [...palace.majorStars, ...palace.minorStars, ...palace.auxiliaryStars].map((star) => star.name);
}

function findTargetPalace(palaces: Palace[], starName: string): Palace | undefined {
  return palaces.find((palace) => allStarNames(palace).includes(starName));
}

function mappingForNatalId(mapping: PalaceMapping[] | undefined, natalPalaceId: number): PalaceMapping | undefined {
  return mapping?.find((item) => item.natalPalaceId === natalPalaceId);
}

export function resolveTransformationTargets(params: {
  palaces: Palace[];
  transformations: Transformation[];
  layer: FortuneLayer;
  decadeMapping?: PalaceMapping[];
  annualMapping?: PalaceMapping[];
}): TransformationTarget[] {
  return params.transformations.map((transform) => {
    const target = findTargetPalace(params.palaces, transform.star) ?? params.palaces[0];
    const opposite = params.palaces[getOppositePalaceId(target.palaceId)];
    const decadeTarget = mappingForNatalId(params.decadeMapping, target.palaceId);
    const annualTarget = mappingForNatalId(params.annualMapping, target.palaceId);
    const notes = findTargetPalace(params.palaces, transform.star)
      ? []
      : [`star ${transform.star} was not found in palaces; target defaulted to 命宫`];

    return {
      layer: params.layer,
      sourceStem: transform.stem,
      star: transform.star,
      transformation: transform.transformation,
      targetNatalPalace: {
        palaceName: target.name,
        palaceId: target.palaceId,
        branch: target.earthlyBranch
      },
      targetDecadePalace: decadeTarget
        ? {
            palaceName: decadeTarget.decadePalaceName ?? decadeTarget.natalPalaceName,
            palaceId: decadeTarget.natalPalaceId
          }
        : undefined,
      targetAnnualPalace: annualTarget
        ? {
            palaceName: annualTarget.annualPalaceName ?? annualTarget.natalPalaceName,
            palaceId: annualTarget.natalPalaceId
          }
        : undefined,
      oppositeNatalPalace: {
        palaceName: opposite.name,
        palaceId: opposite.palaceId,
        branch: opposite.earthlyBranch
      },
      notes
    };
  });
}

export function detectTransformationConflicts(params: {
  natalTargets: TransformationTarget[];
  decadeTargets?: TransformationTarget[];
  annualTargets?: TransformationTarget[];
}): TransformationConflict[] {
  const targets = [
    ...params.natalTargets,
    ...(params.decadeTargets ?? []),
    ...(params.annualTargets ?? [])
  ];
  const byPalace = new Map<number, TransformationTarget[]>();
  for (const target of targets) {
    const current = byPalace.get(target.targetNatalPalace.palaceId) ?? [];
    current.push(target);
    byPalace.set(target.targetNatalPalace.palaceId, current);
  }

  const conflicts: TransformationConflict[] = [];
  for (const [palaceId, palaceTargets] of byPalace.entries()) {
    const transformations = palaceTargets.map((item) => item.transformation);
    const layers = [...new Set(palaceTargets.map((item) => item.layer))];
    const palaceName = palaceTargets[0].targetNatalPalace.palaceName;

    if (transformations.filter((item) => item === "忌").length > 1) {
      conflicts.push({
        type: "叠忌",
        involvedLayers: layers,
        palaces: [{ natalPalaceName: palaceName, palaceId }],
        stars: palaceTargets.filter((item) => item.transformation === "忌").map((item) => item.star),
        severity: "high"
      });
    }
    if (transformations.filter((item) => item === "禄").length > 1) {
      conflicts.push({
        type: "叠禄",
        involvedLayers: layers,
        palaces: [{ natalPalaceName: palaceName, palaceId }],
        stars: palaceTargets.filter((item) => item.transformation === "禄").map((item) => item.star),
        severity: "medium"
      });
    }
    if (transformations.includes("禄") && transformations.includes("忌")) {
      conflicts.push({
        type: "禄忌同宫",
        involvedLayers: layers,
        palaces: [{ natalPalaceName: palaceName, palaceId }],
        stars: palaceTargets.map((item) => item.star),
        severity: "high"
      });
    }
  }

  return conflicts;
}
