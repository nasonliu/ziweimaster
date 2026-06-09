export type Gender = "male" | "female";
export type CalendarType = "solar" | "lunar";
export type Locale = "zh-CN" | "zh-TW" | "en";
export type Layer = "natal" | "decade" | "annual" | "monthly" | "daily";
export type FortuneLayer = "natal" | "decade" | "annual";
export type TransformationType = "禄" | "权" | "科" | "忌";

export type PalaceName =
  | "命宫"
  | "兄弟宫"
  | "夫妻宫"
  | "子女宫"
  | "财帛宫"
  | "疾厄宫"
  | "迁移宫"
  | "交友宫"
  | "官禄宫"
  | "田宅宫"
  | "福德宫"
  | "父母宫";

export type BirthInput = {
  gender: Gender;
  birthDateTime: string;
  calendarType: CalendarType;
  trueSolarTime?: boolean;
  longitude?: number;
  latitude?: number;
  birthPlaceProvince?: string;
  birthPlaceCity?: string;
  timezone?: string;
  name?: string;
  locale?: Locale;
};

export type AnnualInput = BirthInput & {
  year: number;
};

export type Star = {
  name: string;
  brightness?: string;
  transformation?: TransformationType;
  selfTransformation?: {
    type: "向心" | "离心";
    transformation: TransformationType;
  };
  tags?: string[];
};

export type Palace = {
  palaceId: number;
  name: string;
  heavenlyStem: string;
  earthlyBranch: string;
  majorStars: Star[];
  minorStars: Star[];
  auxiliaryStars: Star[];
  gods?: string[];
  changsheng?: string;
  boshi?: string;
  jiangqian?: string;
  suiqian?: string;
  isBodyPalace?: boolean;
  isMingPalace?: boolean;
};

export type Transformation = {
  layer: Layer;
  stem: string;
  star: string;
  transformation: TransformationType;
};

export type TransformationTarget = {
  layer: FortuneLayer;
  sourceStem: string;
  star: string;
  transformation: TransformationType;
  targetNatalPalace: {
    palaceName: string;
    palaceId: number;
    branch: string;
  };
  targetDecadePalace?: {
    palaceName: string;
    palaceId: number;
  };
  targetAnnualPalace?: {
    palaceName: string;
    palaceId: number;
  };
  oppositeNatalPalace: {
    palaceName: string;
    palaceId: number;
    branch: string;
  };
  notes?: string[];
};

export type TransformationConflict = {
  type:
    | "禄忌同宫"
    | "禄忌对冲"
    | "叠忌"
    | "叠禄"
    | "权忌交战"
    | "科忌同宫"
    | "忌冲命"
    | "忌冲财"
    | "忌冲官"
    | "忌冲夫妻"
    | "忌冲子女";
  involvedLayers: FortuneLayer[];
  palaces: {
    natalPalaceName: string;
    palaceId: number;
  }[];
  stars: string[];
  severity: "low" | "medium" | "high";
};

export type SanfangResult = {
  center: {
    palaceName: string;
    palaceId: number;
    branch: string;
    stars: Star[];
  };
  opposite: {
    palaceName: string;
    palaceId: number;
    branch: string;
    stars: Star[];
  };
  trines: {
    palaceName: string;
    palaceId: number;
    branch: string;
    stars: Star[];
  }[];
  allPalaces: {
    palaceName: string;
    palaceId: number;
    role: "center" | "opposite" | "trine";
    stars: Star[];
    transformations: Transformation[];
  }[];
  summaryForLLM: {
    starNames: string[];
    transformationSummary: string[];
    warnings: string[];
  };
};

export type PalaceMapping = {
  decadePalaceName?: string;
  annualPalaceName?: string;
  natalPalaceName: string;
  natalPalaceId: number;
  branch: string;
};

export type TripleLayerMapping = {
  annualPalaceName: string;
  annualPalaceId: number;
  mapsToNatal: {
    palaceName: string;
    palaceId: number;
    branch: string;
  };
  mapsToDecade: {
    palaceName: string;
    palaceId: number;
    branch: string;
  };
  stars: {
    natalStars: Star[];
    decadeStars?: Star[];
    annualStars?: Star[];
  };
  transformations: {
    natal?: Transformation[];
    decade?: Transformation[];
    annual?: Transformation[];
  };
};

export type NatalChartResponse = {
  meta: {
    name?: string;
    gender: string;
    birthDateTime: string;
    lunarDate?: string;
    solarDate?: string;
    trueSolarTime?: string;
    timezone?: string;
    longitude?: number;
    latitude?: number;
    birthPlaceProvince?: string;
    birthPlaceCity?: string;
    birthPlaceSource?: string;
    fiveElementClass?: string;
    lifeMaster?: string;
    bodyMaster?: string;
    bodyPalace?: string;
    mingPalace?: string;
  };
  palaces: Palace[];
  sihua: {
    natalYearStem: string;
    natalTransformations: Transformation[];
  };
  relationships: {
    oppositeMap: Record<string, string>;
    trineMap: Record<string, string[]>;
    sanfangSizhengMap: Record<string, string[]>;
  };
  warnings: string[];
};

export type DecadeFortune = {
  index: number;
  ageRange: [number, number];
  yearRange: [number, number];
  decadeStemBranch?: string;
  decadeMingPalace: {
    natalPalaceName: string;
    palaceId: number;
    branch: string;
  };
  palaceMapping: PalaceMapping[];
  transformations: Transformation[];
  transformationTargets: TransformationTarget[];
  sanfangSizheng: Record<string, SanfangResult>;
  warnings: string[];
};

export type AnnualFortune = {
  year: number;
  sui: number;
  stemBranch: string;
  annualMingPalace: {
    natalPalaceName: string;
    palaceId: number;
    branch: string;
  };
  palaceMapping: PalaceMapping[];
  transformations: Transformation[];
  transformationTargets: TransformationTarget[];
  sanfangSizheng: Record<string, SanfangResult>;
  currentDecade: DecadeFortune;
  tripleLayerMapping: TripleLayerMapping[];
  warnings: string[];
};

export type SanfangInput = BirthInput & {
  palaceName: PalaceName;
  layer?: FortuneLayer;
  year?: number;
  decadeIndex?: number;
};

export type AnalysisPayloadInput = BirthInput & {
  year?: number;
  focusPalaces?: PalaceName[];
  includeDecade?: boolean;
  includeAnnual?: boolean;
  includeSanfang?: boolean;
  includeTransformations?: boolean;
  includeConflicts?: boolean;
};

export type PalaceDetail = {
  palace: Palace;
  aliases: string[];
  sanfangSizheng?: SanfangResult;
  relatedTransformations: TransformationTarget[];
};

export type LlmAnalysisPayload = {
  meta: Record<string, unknown>;
  focus: {
    requestedPalaces: PalaceName[];
    currentYear?: number;
    currentAge?: number;
    currentDecade?: {
      ageRange: [number, number];
      decadeMingPalace: string;
    };
  };
  natal: {
    palaces: Palace[];
    focusPalaces: PalaceDetail[];
  };
  decade?: {
    decadeInfo: DecadeFortune;
    focusPalaces: PalaceDetail[];
  };
  annual?: {
    annualInfo: AnnualFortune;
    focusPalaces: PalaceDetail[];
  };
  mappings: {
    natalToDecade?: PalaceMapping[];
    natalToAnnual?: PalaceMapping[];
    decadeToAnnual?: PalaceMapping[];
    tripleLayer?: TripleLayerMapping[];
  };
  transformations: {
    natal: TransformationTarget[];
    decade?: TransformationTarget[];
    annual?: TransformationTarget[];
    conflicts?: TransformationConflict[];
  };
  sanfangSizheng: Record<string, SanfangResult>;
  llmHints: {
    importantStars: string[];
    activatedPalaces: string[];
    riskPalaces: string[];
    opportunityPalaces: string[];
    likelyTopics: string[];
    warnings: string[];
  };
};
