import type { BirthInput } from "../domain/types.js";

export type TrueSolarTimeResult = {
  applied: boolean;
  originalDateTime: string;
  trueSolarDateTime?: string;
  correctionMinutes: number;
  equationOfTimeMinutes: number;
  longitudeCorrectionMinutes: number;
  timezoneOffsetHours?: number;
  warnings: string[];
};

export type EffectiveAstrolabeDateTime = {
  date: string;
  hour: number;
  minute: number;
  isoLike: string;
  trueSolar?: TrueSolarTimeResult;
  warnings: string[];
};

type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  offset: string;
  offsetHours: number;
};

function parseLocalDateTime(value: string): LocalDateTimeParts | undefined {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/
  );
  if (!match) {
    return undefined;
  }
  const [, year, month, day, hour, minute, second = "00", offset] = match;
  const offsetHours =
    offset === "Z"
      ? 0
      : Number(offset.slice(0, 3)) + Number(offset.slice(4, 6)) / 60 * (offset.startsWith("-") ? -1 : 1);
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
    offset,
    offsetHours
  };
}

function dayOfYear(parts: LocalDateTimeParts): number {
  const start = Date.UTC(parts.year, 0, 0);
  const current = Date.UTC(parts.year, parts.month - 1, parts.day);
  return Math.floor((current - start) / 86_400_000);
}

export function calculateEquationOfTimeMinutes(dayNumber: number): number {
  const b = (2 * Math.PI * (dayNumber - 81)) / 364;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function formatIsoLike(date: Date, offset: string): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}${offset}`;
}

export function calculateTrueSolarTime(input: BirthInput): TrueSolarTimeResult {
  const warnings: string[] = [];
  const parsed = parseLocalDateTime(input.birthDateTime);
  if (!input.trueSolarTime) {
    return {
      applied: false,
      originalDateTime: input.birthDateTime,
      correctionMinutes: 0,
      equationOfTimeMinutes: 0,
      longitudeCorrectionMinutes: 0,
      warnings
    };
  }
  if (!parsed) {
    return {
      applied: false,
      originalDateTime: input.birthDateTime,
      correctionMinutes: 0,
      equationOfTimeMinutes: 0,
      longitudeCorrectionMinutes: 0,
      warnings: ["birthDateTime must include an ISO timezone offset for trueSolarTime"]
    };
  }
  if (typeof input.longitude !== "number") {
    return {
      applied: false,
      originalDateTime: input.birthDateTime,
      correctionMinutes: 0,
      equationOfTimeMinutes: 0,
      longitudeCorrectionMinutes: 0,
      timezoneOffsetHours: parsed.offsetHours,
      warnings: ["trueSolarTime requires longitude; civil time was used"]
    };
  }

  const standardMeridian = parsed.offsetHours * 15;
  const longitudeCorrectionMinutes = 4 * (input.longitude - standardMeridian);
  const equationOfTimeMinutes = calculateEquationOfTimeMinutes(dayOfYear(parsed));
  const correctionMinutes = longitudeCorrectionMinutes + equationOfTimeMinutes;
  const localAsUtc = Date.UTC(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    parsed.hour,
    parsed.minute,
    parsed.second
  );
  const trueSolar = new Date(localAsUtc + correctionMinutes * 60_000);

  return {
    applied: true,
    originalDateTime: input.birthDateTime,
    trueSolarDateTime: formatIsoLike(trueSolar, parsed.offset),
    correctionMinutes,
    equationOfTimeMinutes,
    longitudeCorrectionMinutes,
    timezoneOffsetHours: parsed.offsetHours,
    warnings
  };
}

export function getEffectiveDateTimeForAstrolabe(input: BirthInput): EffectiveAstrolabeDateTime {
  const trueSolar = calculateTrueSolarTime(input);
  const effective = trueSolar.applied && trueSolar.trueSolarDateTime ? trueSolar.trueSolarDateTime : input.birthDateTime;
  const parsed = parseLocalDateTime(effective);
  if (!parsed) {
    throw new Error("birthDateTime must be an ISO datetime with timezone offset");
  }

  return {
    date: `${String(parsed.year).padStart(4, "0")}-${String(parsed.month).padStart(2, "0")}-${String(
      parsed.day
    ).padStart(2, "0")}`,
    hour: parsed.hour,
    minute: parsed.minute,
    isoLike: effective,
    trueSolar,
    warnings: trueSolar.warnings
  };
}
