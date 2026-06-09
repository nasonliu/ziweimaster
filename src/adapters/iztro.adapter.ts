import { astro } from "iztro";
import { EARTHLY_BRANCHES, HEAVENLY_STEMS, PALACE_ORDER } from "../domain/constants.js";
import type { BirthInput, NatalChartResponse, Palace, Star } from "../domain/types.js";
import { resolveBirthPlace } from "../services/place.service.js";
import { getEffectiveDateTimeForAstrolabe } from "../services/solarTime.service.js";

type AdapterResult = Pick<NatalChartResponse, "meta" | "palaces" | "warnings"> & {
  natalYearStem: string;
};

const FALLBACK_MAJOR_STARS = [
  ["紫微", "天府"],
  ["天机", "太阴"],
  ["太阳", "武曲"],
  ["天同", "廉贞"],
  ["贪狼", "巨门"],
  ["天相", "天梁"],
  ["七杀", "破军"],
  ["文昌", "文曲"],
  ["左辅", "右弼"],
  ["天魁", "天钺"],
  ["火星", "铃星"],
  ["地空", "地劫"]
];

function asStar(name: string): Star {
  return { name };
}

function getBirthYear(input: BirthInput): number {
  return new Date(input.birthDateTime).getFullYear();
}

function getTimeIndex(hour: number): number {
  return Math.floor((hour + 1) / 2) % 12;
}

export function getYearStem(year: number): string {
  return HEAVENLY_STEMS[((year - 4) % 10 + 10) % 10];
}

export function getStemBranch(year: number): string {
  const stem = HEAVENLY_STEMS[((year - 4) % 10 + 10) % 10];
  const branch = EARTHLY_BRANCHES[((year - 4) % 12 + 12) % 12];
  return `${stem}${branch}`;
}

function fallbackPalaces(): Palace[] {
  return PALACE_ORDER.map((name, palaceId) => ({
    palaceId,
    name,
    heavenlyStem: HEAVENLY_STEMS[palaceId % HEAVENLY_STEMS.length],
    earthlyBranch: EARTHLY_BRANCHES[(palaceId + 2) % EARTHLY_BRANCHES.length],
    majorStars: FALLBACK_MAJOR_STARS[palaceId].map(asStar),
    minorStars: palaceId === 3 ? [asStar("天姚")] : [],
    auxiliaryStars: palaceId === 7 ? [asStar("文昌"), asStar("文曲")] : [],
    isMingPalace: palaceId === 0,
    isBodyPalace: palaceId === 3
  }));
}

function normalizePalaceName(rawName: unknown, fallback: string): string {
  if (typeof rawName !== "string") {
    return fallback;
  }
  if (PALACE_ORDER.includes(rawName as (typeof PALACE_ORDER)[number])) {
    return rawName;
  }
  const withSuffix = `${rawName}宫`;
  return PALACE_ORDER.includes(withSuffix as (typeof PALACE_ORDER)[number]) ? withSuffix : rawName;
}

function normalizeIztroPalaces(rawPalaces: unknown): Palace[] | undefined {
  if (!Array.isArray(rawPalaces) || rawPalaces.length !== 12) {
    return undefined;
  }

  const normalized = rawPalaces.map((raw, sourceIndex) => {
    const item = raw as Record<string, unknown>;
    const normalizeStars = (value: unknown): Star[] => {
      if (!Array.isArray(value)) {
        return [];
      }
      return value
        .map((star) => {
          if (typeof star === "string") {
            return { name: star };
          }
          if (star && typeof star === "object") {
            const starRecord = star as Record<string, unknown>;
            const name = starRecord.name ?? starRecord.starName ?? starRecord.label;
            if (typeof name === "string") {
              return {
                name,
                brightness:
                  typeof starRecord.brightness === "string" ? starRecord.brightness : undefined
              };
            }
          }
          return undefined;
        })
        .filter((star): star is Star => Boolean(star));
    };

    return {
      palaceId: sourceIndex,
      name: normalizePalaceName(item.name, PALACE_ORDER[sourceIndex]),
      heavenlyStem:
        typeof item.heavenlyStem === "string" ? item.heavenlyStem : HEAVENLY_STEMS[sourceIndex % 10],
      earthlyBranch:
        typeof item.earthlyBranch === "string" ? item.earthlyBranch : EARTHLY_BRANCHES[(sourceIndex + 2) % 12],
      majorStars: normalizeStars(item.majorStars),
      minorStars: normalizeStars(item.minorStars),
      auxiliaryStars: normalizeStars(item.adjectiveStars ?? item.auxiliaryStars),
      gods: Array.isArray(item.gods) ? item.gods.filter((god): god is string => typeof god === "string") : undefined,
      changsheng: typeof item.changsheng12 === "string" ? item.changsheng12 : undefined,
      boshi: typeof item.boshi12 === "string" ? item.boshi12 : undefined,
      jiangqian: typeof item.jiangqian12 === "string" ? item.jiangqian12 : undefined,
      suiqian: typeof item.suiqian12 === "string" ? item.suiqian12 : undefined,
      isBodyPalace: Boolean(item.isBodyPalace),
      isMingPalace: Boolean(item.isOriginalPalace ?? item.isMingPalace)
    };
  });

  return PALACE_ORDER.map((name, palaceId) => {
    const palace = normalized.find((item) => item.name === name);
    return {
      ...(palace ?? fallbackPalaces()[palaceId]),
      palaceId,
      name
    };
  });
}

export function buildNatalFromAdapter(input: BirthInput): AdapterResult {
  const birthYear = getBirthYear(input);
  const place = resolveBirthPlace(input);
  const effective = getEffectiveDateTimeForAstrolabe({
    ...input,
    longitude: place.longitude,
    latitude: place.latitude,
    birthPlaceProvince: place.province,
    birthPlaceCity: place.city
  });
  const warnings: string[] = [...place.warnings, ...effective.warnings];

  let normalizedPalaces: Palace[] | undefined;
  try {
    const gender = input.gender === "male" ? "男" : "女";
    const language = input.locale ?? "zh-CN";
    const astrolabe =
      input.calendarType === "solar"
        ? astro.bySolar(effective.date, getTimeIndex(effective.hour), gender, true, language)
        : astro.byLunar(effective.date, getTimeIndex(effective.hour), gender, false, true, language);
    normalizedPalaces = normalizeIztroPalaces(astrolabe.palaces);
    if (normalizedPalaces) {
      normalizedPalaces = normalizedPalaces.map((palace) => ({
        ...palace,
        isMingPalace: palace.earthlyBranch === astrolabe.earthlyBranchOfSoulPalace || palace.isMingPalace,
        isBodyPalace: palace.earthlyBranch === astrolabe.earthlyBranchOfBodyPalace || palace.isBodyPalace
      }));
    }
  } catch {
    normalizedPalaces = undefined;
  }

  if (!normalizedPalaces) {
    warnings.push("iztro adapter fallback chart was used because engine output was unavailable or incomplete");
  }

  const palaces = normalizedPalaces ?? fallbackPalaces();
  const ming = palaces.find((palace) => palace.isMingPalace) ?? palaces[0];
  const body = palaces.find((palace) => palace.isBodyPalace) ?? palaces[3];

  return {
    meta: {
      name: input.name,
      gender: input.gender,
      birthDateTime: input.birthDateTime,
      solarDate: input.calendarType === "solar" ? input.birthDateTime.slice(0, 10) : undefined,
      lunarDate: input.calendarType === "lunar" ? input.birthDateTime.slice(0, 10) : undefined,
      trueSolarTime: effective.trueSolar?.trueSolarDateTime,
      timezone: input.timezone,
      longitude: place.longitude,
      latitude: place.latitude,
      birthPlaceProvince: place.province,
      birthPlaceCity: place.city,
      birthPlaceSource: place.source,
      fiveElementClass: "未知",
      lifeMaster: "命主待确认",
      bodyMaster: "身主待确认",
      bodyPalace: body.name,
      mingPalace: ming.name
    },
    palaces,
    natalYearStem: getYearStem(birthYear),
    warnings
  };
}

export const __private = {
  normalizeIztroPalaces
};
