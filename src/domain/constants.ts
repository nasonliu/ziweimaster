import type { PalaceName } from "./types.js";

export const PALACE_ORDER: PalaceName[] = [
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

export const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

export const EARTHLY_BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥"
] as const;

export type StemOrBranchAttribute = {
  yinYang: "阴" | "阳";
  fiveElement: "木" | "火" | "土" | "金" | "水";
};

export const STEM_ATTRIBUTES: Record<string, StemOrBranchAttribute> = {
  甲: { yinYang: "阳", fiveElement: "木" },
  乙: { yinYang: "阴", fiveElement: "木" },
  丙: { yinYang: "阳", fiveElement: "火" },
  丁: { yinYang: "阴", fiveElement: "火" },
  戊: { yinYang: "阳", fiveElement: "土" },
  己: { yinYang: "阴", fiveElement: "土" },
  庚: { yinYang: "阳", fiveElement: "金" },
  辛: { yinYang: "阴", fiveElement: "金" },
  壬: { yinYang: "阳", fiveElement: "水" },
  癸: { yinYang: "阴", fiveElement: "水" }
};

export const BRANCH_ATTRIBUTES: Record<string, StemOrBranchAttribute> = {
  子: { yinYang: "阳", fiveElement: "水" },
  丑: { yinYang: "阴", fiveElement: "土" },
  寅: { yinYang: "阳", fiveElement: "木" },
  卯: { yinYang: "阴", fiveElement: "木" },
  辰: { yinYang: "阳", fiveElement: "土" },
  巳: { yinYang: "阴", fiveElement: "火" },
  午: { yinYang: "阳", fiveElement: "火" },
  未: { yinYang: "阴", fiveElement: "土" },
  申: { yinYang: "阳", fiveElement: "金" },
  酉: { yinYang: "阴", fiveElement: "金" },
  戌: { yinYang: "阳", fiveElement: "土" },
  亥: { yinYang: "阴", fiveElement: "水" }
};

export const MODERN_PALACE_MEANINGS: Record<string, string[]> = {
  子女宫: ["子女", "项目", "产品", "下属", "员工", "学生", "徒弟", "作品", "内容产出"],
  财帛宫: ["现金流", "收入", "商业模式", "利润", "交易"],
  官禄宫: ["事业", "职业", "组织位置", "管理系统", "工作结构"],
  交友宫: ["合作人", "员工关系", "外包", "客户关系", "社群"],
  迁移宫: ["外部市场", "出海", "异地", "平台", "外部机会"]
};

export const DEFAULT_WARNINGS = {
  trueSolarTime: "trueSolarTime calculation is not implemented yet",
  longitude: "longitude correction is captured in metadata but not applied by the local adapter",
  adapterFallback: "iztro adapter fallback chart was used because engine output was unavailable or incomplete"
} as const;
