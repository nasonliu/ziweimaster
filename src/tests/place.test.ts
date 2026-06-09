import { describe, expect, test } from "vitest";
import { findChinaCity, getCitiesByProvince, getChinaProvinces } from "../domain/chinaCities.js";
import { resolveBirthPlace } from "../services/place.service.js";

describe("China city place library", () => {
  test("looks up prefecture-level city centers by province and city", () => {
    expect(getChinaProvinces()).toContain("北京市");
    expect(getCitiesByProvince("广东省").map((item) => item.city)).toContain("广州市");
    expect(findChinaCity({ province: "四川省", city: "成都市" })).toMatchObject({
      longitude: 104.0665,
      latitude: 30.5728,
      precision: "prefecture-center"
    });
  });

  test("uses manual longitude when supplied", () => {
    const result = resolveBirthPlace({
      gender: "male",
      birthDateTime: "1981-06-20T00:30:00+08:00",
      calendarType: "solar",
      birthPlaceProvince: "北京市",
      birthPlaceCity: "北京市",
      longitude: 116.917
    });

    expect(result.source).toBe("manual");
    expect(result.longitude).toBe(116.917);
  });

  test("resolves longitude from city library when manual longitude is omitted", () => {
    const result = resolveBirthPlace({
      gender: "male",
      birthDateTime: "1981-06-20T00:30:00+08:00",
      calendarType: "solar",
      birthPlaceProvince: "北京市",
      birthPlaceCity: "北京市"
    });

    expect(result.source).toBe("china-city-library");
    expect(result.longitude).toBeCloseTo(116.4074, 4);
    expect(result.warnings[0]).toContain("prefecture-level city center");
  });
});
