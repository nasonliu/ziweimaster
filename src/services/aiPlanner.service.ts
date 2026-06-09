import { PALACE_ORDER } from "../domain/constants.js";
import type { FortuneLayer, PalaceName } from "../domain/types.js";
import type { AiAnalysisInput } from "./deepseek.service.js";

export type AiPlannerToolName = "analysis_payload" | "inspect_palace";

export type AiPlannerToolCall = {
  tool: AiPlannerToolName;
  layer: FortuneLayer;
  palaceName: PalaceName;
  year: number;
  reason: string;
};

export type AiPlannerPlan = {
  summary: string;
  uiFocus: {
    layer: FortuneLayer;
    palaceName: PalaceName;
    year: number;
  };
  toolCalls: AiPlannerToolCall[];
};

const LAYERS: FortuneLayer[] = ["natal", "decade", "annual"];
const TOOLS: AiPlannerToolName[] = ["analysis_payload", "inspect_palace"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLayer(value: unknown, fallback: FortuneLayer): FortuneLayer {
  return LAYERS.includes(value as FortuneLayer) ? (value as FortuneLayer) : fallback;
}

function normalizePalace(value: unknown, fallback: PalaceName): PalaceName {
  return PALACE_ORDER.includes(value as PalaceName) ? (value as PalaceName) : fallback;
}

function normalizeYear(value: unknown, fallback: number): number {
  const year = typeof value === "number" ? value : Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= 2200 ? year : fallback;
}

function normalizeTool(value: unknown): AiPlannerToolName {
  return TOOLS.includes(value as AiPlannerToolName) ? (value as AiPlannerToolName) : "inspect_palace";
}

export function defaultPlannerPlan(input: AiAnalysisInput, currentYear = new Date().getFullYear()): AiPlannerPlan {
  const palaceName = input.palaceName ?? input.focusPalaces?.[0] ?? "命宫";
  const layer = input.layer ?? "annual";
  const year = input.year ?? currentYear;
  return {
    summary: "模型调度不可用，沿用当前界面选择。",
    uiFocus: {
      layer,
      palaceName,
      year
    },
    toolCalls: [
      {
        tool: "analysis_payload",
        layer,
        palaceName,
        year,
        reason: "取得完整 LLM payload"
      },
      {
        tool: "inspect_palace",
        layer,
        palaceName,
        year,
        reason: "取得当前关注宫位、三方四正和宫干四化"
      }
    ]
  };
}

export function buildPlannerPrompt(input: AiAnalysisInput): string {
  return [
    "你是紫微斗数 MCP 调度器。你的任务不是解盘，而是判断为了回答用户问题，应该调用哪些盘面工具。",
    "你必须从紫微斗数原理出发选择要看的层级和宫位：本命看原局结构，大限看十年运势，流年看指定年份事件；涉及财务看财帛宫及三方四正，事业看官禄宫，关系看夫妻宫或交友宫，迁移/外部机会看迁移宫。",
    "如果专家侧重是南派或三合派，多调度三方四正相关宫位；如果专家侧重是北派或飞星派，多调度四化飞星和宫干引动相关宫位。",
    "北派或飞星派调度必须关注能量流动轨迹：发射宫/宫干、禄权科忌所化星、落入宫位、对宫反冲、三方四正承接宫位。必要时为落点宫和反冲宫追加 inspect_palace。",
    "可用工具只有：analysis_payload、inspect_palace。",
    "层级只能是：natal、decade、annual。宫位只能是：命宫、兄弟宫、夫妻宫、子女宫、财帛宫、疾厄宫、迁移宫、交友宫、官禄宫、田宅宫、福德宫、父母宫。",
    "toolCalls 最多 6 个。reason 必须简短，不超过 18 个汉字。",
    "返回 JSON，不要 Markdown，不要解释推理过程。格式：",
    '{"summary":"一句话说明调度思路","uiFocus":{"layer":"annual","palaceName":"财帛宫","year":2028},"toolCalls":[{"tool":"analysis_payload","layer":"annual","palaceName":"财帛宫","year":2028,"reason":"为什么需要这个工具"},{"tool":"inspect_palace","layer":"annual","palaceName":"财帛宫","year":2028,"reason":"为什么点击这个宫位"}]}',
    "当前界面上下文 JSON:",
    JSON.stringify({
      year: input.year,
      layer: input.layer,
      palaceName: input.palaceName,
      focusPalaces: input.focusPalaces,
      expertProfile: input.expertProfile,
      answerStyle: input.answerStyle,
      allowFollowup: input.allowFollowup,
      personalContext: input.personalContext,
      messages: input.messages?.slice(-12)
    }),
    `用户问题：${input.question ?? "请按当前盘面自动选择需要查看的信息。"}`
  ].join("\n");
}

export function parsePlannerResponse(text: string, fallback: AiPlannerPlan): AiPlannerPlan {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return fallback;
  }
  if (!isRecord(parsed)) return fallback;
  const ui = isRecord(parsed.uiFocus) ? parsed.uiFocus : {};
  const layer = normalizeLayer(ui.layer, fallback.uiFocus.layer);
  const palaceName = normalizePalace(ui.palaceName, fallback.uiFocus.palaceName);
  const year = normalizeYear(ui.year, fallback.uiFocus.year);
  const rawCalls = Array.isArray(parsed.toolCalls) ? parsed.toolCalls : [];
  const toolCalls = rawCalls
    .filter(isRecord)
    .slice(0, 6)
    .map((call) => ({
      tool: normalizeTool(call.tool),
      layer: normalizeLayer(call.layer, layer),
      palaceName: normalizePalace(call.palaceName, palaceName),
      year: normalizeYear(call.year, year),
      reason: typeof call.reason === "string" && call.reason.trim() ? call.reason.trim() : "模型要求读取此盘面信息"
    }));

  return {
    summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : fallback.summary,
    uiFocus: { layer, palaceName, year },
    toolCalls: toolCalls.length
      ? toolCalls
      : [
          {
            tool: "inspect_palace",
            layer,
            palaceName,
            year,
            reason: "模型选择的默认点击宫位"
          }
        ]
  };
}
