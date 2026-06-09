import { describe, expect, test } from "vitest";
import { BRANCH_ATTRIBUTES, STEM_ATTRIBUTES, PALACE_ORDER } from "../domain/constants.js";
import {
  getOppositePalaceId,
  getPalaceIdByName,
  getSanfangSizhengPalaceIds,
  getTrinePalaceIds
} from "../domain/palace.js";
import { getTransformationsByStem } from "../domain/sihua.js";

describe("palace domain helpers", () => {
  test("uses the standard twelve-palace order", () => {
    expect(PALACE_ORDER).toEqual([
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
    ]);
  });

  test("calculates opposite, trine, and sanfang-sizheng palace ids", () => {
    expect(getOppositePalaceId(3)).toBe(9);
    expect(getTrinePalaceIds(3)).toEqual([7, 11]);
    expect(getSanfangSizhengPalaceIds(3)).toEqual([3, 9, 7, 11]);
    expect(getPalaceIdByName("子女宫")).toBe(3);
  });
});

describe("sihua domain helpers", () => {
  test("returns the 2026 Bing stem transformations", () => {
    expect(getTransformationsByStem("丙", "annual")).toEqual([
      { layer: "annual", stem: "丙", star: "天同", transformation: "禄" },
      { layer: "annual", stem: "丙", star: "天机", transformation: "权" },
      { layer: "annual", stem: "丙", star: "文昌", transformation: "科" },
      { layer: "annual", stem: "丙", star: "廉贞", transformation: "忌" }
    ]);
  });
});

describe("stem and branch attributes", () => {
  test("exposes yin-yang and five-element metadata", () => {
    expect(STEM_ATTRIBUTES.甲).toEqual({ yinYang: "阳", fiveElement: "木" });
    expect(STEM_ATTRIBUTES.癸).toEqual({ yinYang: "阴", fiveElement: "水" });
    expect(BRANCH_ATTRIBUTES.子).toEqual({ yinYang: "阳", fiveElement: "水" });
    expect(BRANCH_ATTRIBUTES.酉).toEqual({ yinYang: "阴", fiveElement: "金" });
  });
});
