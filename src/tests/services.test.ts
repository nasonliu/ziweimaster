import { describe, expect, test } from "vitest";
import { getNatalChart } from "../services/chart.service.js";
import { getAnnualFortune, getDecades } from "../services/horoscope.service.js";
import { buildLlmAnalysisPayload } from "../services/llmPayload.service.js";
import { getSanfangSizheng } from "../services/sanfang.service.js";
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

describe("chart and fortune services", () => {
  test("generates a natal chart with twelve palaces and key metadata", () => {
    const chart = getNatalChart(sampleInput);

    expect(chart.palaces).toHaveLength(12);
    expect(chart.meta.gender).toBe("male");
    expect(chart.meta.mingPalace).toBeTruthy();
    expect(chart.meta.bodyPalace).toBeTruthy();
    expect(chart.sihua.natalTransformations).toHaveLength(4);
    expect(chart.relationships.sanfangSizhengMap["子女宫"]).toEqual([
      "子女宫",
      "田宅宫",
      "交友宫",
      "父母宫"
    ]);
    expect(chart.meta.trueSolarTime).toMatch(/^1981-06-20T00:16:/);
    expect(chart.warnings).not.toContain("trueSolarTime calculation is not implemented yet");
  });

  test("generates twelve decades and exposes the fifth decade child-palace mapping", () => {
    const decades = getDecades(sampleInput);
    const fifth = decades[4];

    expect(decades).toHaveLength(12);
    expect(fifth.index).toBe(5);
    expect(fifth.ageRange).toEqual([44, 53]);
    expect(fifth.yearRange).toEqual([2024, 2033]);
    expect(fifth.decadeMingPalace.palaceId).toBeGreaterThanOrEqual(0);
    expect(fifth.palaceMapping.find((item) => item.decadePalaceName === "大限子女宫")).toMatchObject({
      decadePalaceName: "大限子女宫"
    });
    expect(fifth.sanfangSizheng["大限子女宫"].center.palaceName).toBe("大限子女宫");
  });

  test("generates 2026 annual fortune with annual child-palace and triple-layer mapping", () => {
    const annual = getAnnualFortune({ ...sampleInput, year: 2026 });

    expect(annual.year).toBe(2026);
    expect(annual.sui).toBe(46);
    expect(annual.stemBranch).toBe("丙午");
    expect(annual.transformations.map((item) => `${item.star}${item.transformation}`)).toEqual([
      "天同禄",
      "天机权",
      "文昌科",
      "廉贞忌"
    ]);
    expect(annual.palaceMapping.find((item) => item.annualPalaceName === "流年子女宫")).toBeTruthy();
    expect(annual.tripleLayerMapping.find((item) => item.annualPalaceName === "流年子女宫")).toBeTruthy();
  });

  test("calculates natal sanfang-sizheng for 子女宫", () => {
    const chart = getNatalChart(sampleInput);
    const result = getSanfangSizheng({ palaces: chart.palaces, palaceId: 3 });

    expect(result.center.palaceName).toBe("子女宫");
    expect(result.opposite.palaceName).toBe("田宅宫");
    expect(result.trines.map((item) => item.palaceName)).toEqual(["交友宫", "父母宫"]);
    expect(result.allPalaces).toHaveLength(4);
  });

  test("builds an LLM payload for 子女宫 focus with complete JSON sections", () => {
    const payload = buildLlmAnalysisPayload({
      ...sampleInput,
      year: 2026,
      focusPalaces: ["子女宫"],
      includeAnnual: true,
      includeDecade: true,
      includeSanfang: true,
      includeTransformations: true,
      includeConflicts: true
    });

    expect(payload.focus.requestedPalaces).toEqual(["子女宫"]);
    expect(payload.focus.currentYear).toBe(2026);
    expect(payload.natal.focusPalaces[0].palace.name).toBe("子女宫");
    expect(payload.decade?.focusPalaces[0].palace.name).toBe("大限子女宫");
    expect(payload.annual?.focusPalaces[0].palace.name).toBe("流年子女宫");
    expect(payload.sanfangSizheng["本命子女宫"]).toBeTruthy();
    expect(payload.transformations.annual?.map((item) => item.star)).toContain("天同");
    expect(payload.llmHints.likelyTopics).toEqual(
      expect.arrayContaining(["项目", "员工", "产品", "现金流", "合作人", "外部市场"])
    );
  });
});
