import { PALACE_ORDER } from "./constants.js";
import type { PalaceName } from "./types.js";

export function normalizePalaceId(palaceId: number): number {
  return ((palaceId % 12) + 12) % 12;
}

export function getPalaceIdByName(palaceName: PalaceName | string): number {
  const normalized = palaceName.replace(/^本命|^大限|^流年/, "");
  const index = PALACE_ORDER.findIndex((name) => name === normalized);
  if (index === -1) {
    throw new Error(`Unknown palace name: ${palaceName}`);
  }
  return index;
}

export function getOppositePalaceId(palaceId: number): number {
  return normalizePalaceId(palaceId + 6);
}

export function getTrinePalaceIds(palaceId: number): number[] {
  return [normalizePalaceId(palaceId + 4), normalizePalaceId(palaceId + 8)];
}

export function getSanfangSizhengPalaceIds(palaceId: number): number[] {
  return [normalizePalaceId(palaceId), getOppositePalaceId(palaceId), ...getTrinePalaceIds(palaceId)];
}
