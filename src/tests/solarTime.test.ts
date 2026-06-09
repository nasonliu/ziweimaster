import { describe, expect, test } from "vitest";
import { calculateTrueSolarTime, getEffectiveDateTimeForAstrolabe } from "../services/solarTime.service.js";
import type { BirthInput } from "../domain/types.js";

const sampleInput: BirthInput = {
  gender: "male",
  birthDateTime: "1981-06-20T00:30:00+08:00",
  calendarType: "solar",
  trueSolarTime: true,
  longitude: 116.917,
  timezone: "Asia/Shanghai",
  locale: "zh-CN"
};

describe("true solar time", () => {
  test("calculates correction minutes from equation of time, longitude, and ISO offset", () => {
    const result = calculateTrueSolarTime(sampleInput);

    expect(result.applied).toBe(true);
    expect(result.timezoneOffsetHours).toBe(8);
    expect(result.longitudeCorrectionMinutes).toBeCloseTo(-12.332, 3);
    expect(result.equationOfTimeMinutes).toBeGreaterThan(-3);
    expect(result.equationOfTimeMinutes).toBeLessThan(0);
    expect(result.correctionMinutes).toBeCloseTo(
      result.longitudeCorrectionMinutes + result.equationOfTimeMinutes,
      6
    );
    expect(result.trueSolarDateTime).toMatch(/^1981-06-20T00:16:/);
  });

  test("reports warnings when true solar time is requested without longitude", () => {
    const result = calculateTrueSolarTime({ ...sampleInput, longitude: undefined });

    expect(result.applied).toBe(false);
    expect(result.warnings).toContain("trueSolarTime requires longitude; civil time was used");
  });

  test("provides the effective datetime used by the astrolabe adapter", () => {
    const effective = getEffectiveDateTimeForAstrolabe(sampleInput);

    expect(effective.date).toBe("1981-06-20");
    expect(effective.hour).toBe(0);
    expect(effective.minute).toBe(16);
    expect(effective.warnings).not.toContain("trueSolarTime calculation is not implemented yet");
  });
});
