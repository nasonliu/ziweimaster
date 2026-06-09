import { findChinaCity, getChinaProvinces, getCitiesByProvince, CHINA_CITIES } from "../domain/chinaCities.js";
import type { BirthInput } from "../domain/types.js";

export function resolveBirthPlace(input: BirthInput): {
  longitude?: number;
  latitude?: number;
  province?: string;
  city?: string;
  source: "manual" | "china-city-library" | "none";
  warnings: string[];
} {
  if (typeof input.longitude === "number") {
    return {
      longitude: input.longitude,
      latitude: input.latitude,
      province: input.birthPlaceProvince,
      city: input.birthPlaceCity,
      source: "manual",
      warnings: []
    };
  }

  const matched = findChinaCity({
    province: input.birthPlaceProvince,
    city: input.birthPlaceCity
  });
  if (matched) {
    return {
      longitude: matched.longitude,
      latitude: matched.latitude,
      province: matched.province,
      city: matched.city,
      source: "china-city-library",
      warnings: [`birth place resolved by China prefecture-level city center: ${matched.province}${matched.city}`]
    };
  }

  return {
    source: "none",
    warnings: input.birthPlaceCity ? [`birth place city not found: ${input.birthPlaceCity}`] : []
  };
}

export function getChinaCityLibrary() {
  return {
    provinces: getChinaProvinces(),
    cities: CHINA_CITIES,
    byProvince: Object.fromEntries(getChinaProvinces().map((province) => [province, getCitiesByProvince(province)]))
  };
}
