import { MODERN_PALACE_MEANINGS, PALACE_ORDER } from "../domain/constants.js";
import { getPalaceIdByName } from "../domain/palace.js";
import type {
  AnalysisPayloadInput,
  LlmAnalysisPayload,
  Palace,
  PalaceDetail,
  PalaceName,
  SanfangResult,
  TransformationTarget
} from "../domain/types.js";
import { getNatalChart } from "./chart.service.js";
import { detectTransformationConflicts, resolveTransformationTargets } from "./flystar.service.js";
import { getAnnualFortune, getDecades } from "./horoscope.service.js";
import { remapPalacesForLayer } from "./mapping.service.js";
import { getSanfangSizheng } from "./sanfang.service.js";

function collectRelatedTargets(targets: TransformationTarget[], palace: Palace): TransformationTarget[] {
  return targets.filter(
    (target) =>
      target.targetNatalPalace.palaceId === palace.palaceId ||
      target.oppositeNatalPalace.palaceId === palace.palaceId
  );
}

function buildFocusDetails(params: {
  palaces: Palace[];
  focusPalaces: PalaceName[];
  targets: TransformationTarget[];
  includeSanfang?: boolean;
}): PalaceDetail[] {
  return params.focusPalaces.map((name) => {
    const palace = params.palaces[getPalaceIdByName(name)];
    return {
      palace,
      aliases: MODERN_PALACE_MEANINGS[name] ?? [],
      sanfangSizheng: params.includeSanfang
        ? getSanfangSizheng({ palaces: params.palaces, palaceId: palace.palaceId })
        : undefined,
      relatedTransformations: collectRelatedTargets(params.targets, palace)
    };
  });
}

function deriveLikelyTopics(focusPalaces: PalaceName[]): string[] {
  const related = new Set<string>();
  for (const palaceName of focusPalaces) {
    for (const item of MODERN_PALACE_MEANINGS[palaceName] ?? []) {
      related.add(item);
    }
  }
  if (focusPalaces.includes("子女宫")) {
    for (const relatedPalace of ["财帛宫", "官禄宫", "交友宫", "迁移宫"]) {
      for (const item of MODERN_PALACE_MEANINGS[relatedPalace] ?? []) {
        related.add(item);
      }
    }
  }
  return [...related];
}

export function buildLlmAnalysisPayload(input: AnalysisPayloadInput): LlmAnalysisPayload {
  const focusPalaces: PalaceName[] = input.focusPalaces?.length ? input.focusPalaces : ["命宫"];
  const natal = getNatalChart(input);
  const natalTargets = resolveTransformationTargets({
    palaces: natal.palaces,
    transformations: natal.sihua.natalTransformations,
    layer: "natal"
  });
  const year = input.year;
  const annual = input.includeAnnual && year ? getAnnualFortune({ ...input, year }) : undefined;
  const currentDecade = annual?.currentDecade ?? (input.includeDecade ? getDecades(input)[0] : undefined);
  const decadePalaces = currentDecade ? remapPalacesForLayer(natal.palaces, currentDecade.palaceMapping, "decade") : undefined;
  const annualPalaces = annual ? remapPalacesForLayer(natal.palaces, annual.palaceMapping, "annual") : undefined;
  const conflicts = input.includeConflicts
    ? detectTransformationConflicts({
        natalTargets,
        decadeTargets: currentDecade?.transformationTargets,
        annualTargets: annual?.transformationTargets
      })
    : undefined;
  const sanfangSizheng: Record<string, SanfangResult> = {};

  if (input.includeSanfang) {
    for (const palaceName of focusPalaces) {
      const palaceId = getPalaceIdByName(palaceName);
      sanfangSizheng[`本命${palaceName}`] = getSanfangSizheng({ palaces: natal.palaces, palaceId });
      if (decadePalaces) {
        sanfangSizheng[`大限${palaceName}`] = getSanfangSizheng({ palaces: decadePalaces, palaceId });
      }
      if (annualPalaces) {
        sanfangSizheng[`流年${palaceName}`] = getSanfangSizheng({ palaces: annualPalaces, palaceId });
      }
    }
  }

  const activatedPalaces = [
    ...new Set([
      ...natalTargets.map((target) => target.targetNatalPalace.palaceName),
      ...(annual?.transformationTargets.map((target) => target.targetNatalPalace.palaceName) ?? []),
      ...focusPalaces
    ])
  ];

  return {
    meta: {
      ...natal.meta,
      warnings: [...natal.warnings, ...(annual?.warnings ?? [])]
    },
    focus: {
      requestedPalaces: focusPalaces,
      currentYear: year,
      currentAge: year ? year - new Date(input.birthDateTime).getFullYear() + 1 : undefined,
      currentDecade: currentDecade
        ? {
            ageRange: currentDecade.ageRange,
            decadeMingPalace: currentDecade.decadeMingPalace.natalPalaceName
          }
        : undefined
    },
    natal: {
      palaces: natal.palaces,
      focusPalaces: buildFocusDetails({
        palaces: natal.palaces,
        focusPalaces,
        targets: natalTargets,
        includeSanfang: input.includeSanfang
      })
    },
    decade:
      currentDecade && decadePalaces
        ? {
            decadeInfo: currentDecade,
            focusPalaces: buildFocusDetails({
              palaces: decadePalaces,
              focusPalaces,
              targets: currentDecade.transformationTargets,
              includeSanfang: input.includeSanfang
            })
          }
        : undefined,
    annual:
      annual && annualPalaces
        ? {
            annualInfo: annual,
            focusPalaces: buildFocusDetails({
              palaces: annualPalaces,
              focusPalaces,
              targets: annual.transformationTargets,
              includeSanfang: input.includeSanfang
            })
          }
        : undefined,
    mappings: {
      natalToDecade: currentDecade?.palaceMapping,
      natalToAnnual: annual?.palaceMapping,
      decadeToAnnual: annual?.palaceMapping,
      tripleLayer: annual?.tripleLayerMapping
    },
    transformations: {
      natal: natalTargets,
      decade: input.includeTransformations ? currentDecade?.transformationTargets : undefined,
      annual: input.includeTransformations ? annual?.transformationTargets : undefined,
      conflicts
    },
    sanfangSizheng,
    llmHints: {
      importantStars: [
        ...new Set([
          ...natal.sihua.natalTransformations.map((item) => item.star),
          ...(annual?.transformations.map((item) => item.star) ?? [])
        ])
      ],
      activatedPalaces,
      riskPalaces: [
        ...new Set(
          (conflicts ?? [])
            .filter((conflict) => conflict.severity === "high")
            .flatMap((conflict) => conflict.palaces.map((palace) => palace.natalPalaceName))
        )
      ],
      opportunityPalaces: [
        ...new Set(
          [...natalTargets, ...(annual?.transformationTargets ?? [])]
            .filter((target) => target.transformation === "禄" || target.transformation === "科")
            .map((target) => target.targetNatalPalace.palaceName)
        )
      ],
      likelyTopics: deriveLikelyTopics(focusPalaces).filter((topic) =>
        ["项目", "员工", "产品", "现金流", "合作人", "外部市场", "事业"].includes(topic)
      ),
      warnings: [...new Set([...natal.warnings, ...(annual?.warnings ?? [])])]
    }
  };
}

export const __private = {
  deriveLikelyTopics,
  palaces: PALACE_ORDER
};
