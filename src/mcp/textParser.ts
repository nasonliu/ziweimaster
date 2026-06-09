import { CHINA_CITIES } from "../domain/chinaCities.js";
import type { AnalysisPayloadInput, PalaceName } from "../domain/types.js";

const PALACE_NAMES: PalaceName[] = [
  "命宫",
  "兄弟宫",
  "夫妻宫",
  "子女宫",
  "财帛宫",
  "疾厄宫",
  "迁移宫",
  "交友宫",
  "官禄宫",
  "田宅宫",
  "福德宫",
  "父母宫"
];

export function parseNaturalLanguageBirthInput(text: string): AnalysisPayloadInput {
  const gender = /女/.test(text) && !/男/.test(text) ? "female" : "male";
  const calendarType = /农历|阴历/.test(text) ? "lunar" : "solar";
  const explicitYearMatch = text.match(/(?:流年|年份|看|分析)\D*((?:19|20|21)\d{2})\s*年?/);
  const allYears = [...text.matchAll(/((?:19|20|21)\d{2})\s*年/g)].map((match) => Number(match[1]));
  const dateTimeMatch = text.match(/((?:19|20)\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})[日号]?\s*(\d{1,2})?[点:时]?(\d{1,2})?/);
  const focusPalaces = PALACE_NAMES.filter((palace) => text.includes(palace));
  const city = CHINA_CITIES.find((item) => text.includes(item.city) || text.includes(item.city.replace(/市$/, "")));
  const birthYear = dateTimeMatch?.[1] ?? "1981";
  const birthMonth = String(dateTimeMatch?.[2] ?? "06").padStart(2, "0");
  const birthDay = String(dateTimeMatch?.[3] ?? "20").padStart(2, "0");
  const birthHour = String(dateTimeMatch?.[4] ?? "00").padStart(2, "0");
  const birthMinute = String(dateTimeMatch?.[5] ?? "00").padStart(2, "0");

  return {
    gender,
    calendarType,
    birthDateTime: `${birthYear}-${birthMonth}-${birthDay}T${birthHour}:${birthMinute}:00+08:00`,
    timezone: "Asia/Shanghai",
    trueSolarTime: /真太阳时|真太陽時|太阳时/.test(text),
    birthPlaceProvince: city?.province,
    birthPlaceCity: city?.city,
    year: explicitYearMatch ? Number(explicitYearMatch[1]) : allYears.length > 1 ? allYears[allYears.length - 1] : undefined,
    focusPalaces: focusPalaces.length ? focusPalaces : undefined,
    includeDecade: true,
    includeAnnual: true,
    includeSanfang: true,
    includeTransformations: true,
    includeConflicts: true,
    locale: "zh-CN"
  };
}
