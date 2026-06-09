import { describe, expect, test } from "vitest";
import { inspectPalace } from "../mcp/palaceInspection.js";
import { parseNaturalLanguageBirthInput } from "../mcp/textParser.js";
import { buildPlannerPrompt, defaultPlannerPlan, parsePlannerResponse } from "../services/aiPlanner.service.js";
import { buildAnalysisPrompt, buildClarificationPrompt } from "../services/deepseek.service.js";
import type { InspectPalaceInput } from "../mcp/palaceInspection.js";

const sampleInput: InspectPalaceInput = {
  gender: "male",
  birthDateTime: "1981-06-20T00:30:00+08:00",
  calendarType: "solar",
  trueSolarTime: true,
  birthPlaceProvince: "北京市",
  birthPlaceCity: "北京市",
  timezone: "Asia/Shanghai",
  locale: "zh-CN",
  year: 2026,
  layer: "annual",
  palaceName: "子女宫"
};

describe("MCP palace inspection payload", () => {
  test("returns the same human-visible palace details an AI needs", () => {
    const result = inspectPalace(sampleInput);

    expect(result.selectedPalace.name).toBe("流年子女宫");
    expect(result.selectedPalace.attributes.heavenlyStem).toBeTruthy();
    expect(result.selectedPalace.attributes.heavenlyStemYinYang).toMatch(/阴|阳/);
    expect(result.selectedPalace.stars.length).toBeGreaterThan(0);
    expect(result.visualRelations.opposite).toBe("流年田宅宫");
    expect(result.visualRelations.trines).toEqual(["流年交友宫", "流年父母宫"]);
    expect(result.visualRelations.lineModel.dashedLines).toHaveLength(2);
    expect(result.palaceStemTransformations.targets).toHaveLength(4);
    expect(result.fullLayerPalaces).toHaveLength(12);
  });

  test("parses a natural-language request into structured inputs", () => {
    const parsed = parseNaturalLanguageBirthInput("男，1981年6月20日0点30分，北京出生，用真太阳时，看2026年子女宫");

    expect(parsed.gender).toBe("male");
    expect(parsed.birthDateTime).toBe("1981-06-20T00:30:00+08:00");
    expect(parsed.birthPlaceCity).toBe("北京市");
    expect(parsed.trueSolarTime).toBe(true);
    expect(parsed.year).toBe(2026);
    expect(parsed.focusPalaces).toEqual(["子女宫"]);
  });

  test("builds an LLM planner prompt instead of routing chat with local keyword rules", () => {
    const prompt = buildPlannerPrompt({
      ...sampleInput,
      question: "帮我看一下2028年的财帛宫流年四化，重点看三方四正",
      expertProfile: "feixing",
      answerStyle: "plain",
      allowFollowup: true,
      personalContext: "最近在考虑换工作和合伙投资",
      messages: [
        { role: "user", content: "我主要是自由职业收入。" },
        { role: "assistant", content: "那我会重点看现金流波动。" }
      ]
    });

    expect(prompt).toContain("紫微斗数 MCP 调度器");
    expect(prompt).toContain("可用工具只有：analysis_payload、inspect_palace");
    expect(prompt).toContain("用户问题：帮我看一下2028年的财帛宫流年四化");
    expect(prompt).toContain("expertProfile");
    expect(prompt).toContain("personalContext");
    expect(prompt).toContain("messages");
    expect(prompt).toContain("发射宫/宫干、禄权科忌所化星、落入宫位、对宫反冲");
  });

  test("builds a clarification gate prompt before long-form analysis", () => {
    const prompt = buildClarificationPrompt({
      ...sampleInput,
      question: "帮我看2028年财帛宫",
      expertProfile: "north",
      answerStyle: "mixed",
      allowFollowup: true,
      messages: [
        { role: "user", content: "帮我看2028年财帛宫" },
        { role: "assistant", content: "你的收入主要来自固定工资还是合伙项目？" },
        { role: "user", content: "主要是合伙项目。" }
      ]
    });

    expect(prompt).toContain("追问控制器");
    expect(prompt).toContain("每次最多只问一个问题");
    expect(prompt).toContain('"action":"clarify"');
    expect(prompt).toContain("对话历史 JSON");
    expect(prompt).toContain("主要是合伙项目");
  });

  test("uses the LLM planner JSON to decide UI focus and MCP tool calls", () => {
    const fallback = defaultPlannerPlan(sampleInput, 2026);
    const plan = parsePlannerResponse(
      JSON.stringify({
        summary: "用户问财务流年，应看流年财帛宫并取三方四正。",
        uiFocus: { layer: "annual", palaceName: "财帛宫", year: 2028 },
        toolCalls: [
          {
            tool: "analysis_payload",
            layer: "annual",
            palaceName: "财帛宫",
            year: 2028,
            reason: "取得完整流年结构"
          },
          {
            tool: "inspect_palace",
            layer: "annual",
            palaceName: "财帛宫",
            year: 2028,
            reason: "点击财帛宫读取三方四正和宫干四化"
          }
        ]
      }),
      fallback
    );

    expect(plan.uiFocus).toEqual({ layer: "annual", palaceName: "财帛宫", year: 2028 });
    expect(plan.toolCalls).toHaveLength(2);
    expect(plan.toolCalls[1]).toMatchObject({
      tool: "inspect_palace",
      palaceName: "财帛宫"
    });
  });

  test("sanitizes invalid planner output to safe MCP calls", () => {
    const fallback = defaultPlannerPlan(sampleInput, 2026);
    const plan = parsePlannerResponse(
      JSON.stringify({
        summary: "尝试非法工具",
        uiFocus: { layer: "unknown", palaceName: "不存在", year: 9999 },
        toolCalls: [{ tool: "delete_everything", layer: "bad", palaceName: "坏宫", year: 1, reason: "" }]
      }),
      fallback
    );

    expect(plan.uiFocus).toEqual(fallback.uiFocus);
    expect(plan.toolCalls[0]).toMatchObject({
      tool: "inspect_palace",
      layer: fallback.uiFocus.layer,
      palaceName: fallback.uiFocus.palaceName,
      year: fallback.uiFocus.year
    });
  });

  test("uses a deep consultation prompt for final AI analysis", () => {
    const prompt = buildAnalysisPrompt(
      {
        ...sampleInput,
        expertProfile: "north",
        answerStyle: "plain",
        allowFollowup: true,
        personalContext: "最近在考虑换工作和收入稳定性",
        question: "今年事业和收入上会有什么具体问题？",
        messages: [
          { role: "assistant", content: "你的收入结构更偏工资还是项目制？" },
          { role: "user", content: "项目制，且有合伙人。" }
        ]
      },
      {
        plan: {
          uiFocus: { layer: "annual", palaceName: "财帛宫", year: 2026 }
        }
      }
    );

    expect(prompt).toContain("三合紫微、飞星紫微、河洛紫微、钦天四化");
    expect(prompt).toContain("时间范围、吉凶属性、影响程度");
    expect(prompt).toContain("现实表现、盘面依据、风险/机会等级、可执行建议");
    expect(prompt).toContain("这是连续对话，不是一次性报告");
    expect(prompt).toContain("项目制，且有合伙人");
    expect(prompt).toContain("四化能量轨迹");
    expect(prompt).toContain("发射宫/宫干 → 化曜与四化类型 → 落入宫位 → 对宫反冲");
    expect(prompt).toContain("禄入带来资源、权入带来推动/控制、科入带来名声/缓冲、忌入带来卡点/牵引");
    expect(prompt).toContain("通俗回答要把这些翻译成普通人能理解的生活情境");
    expect(prompt).toContain("仅供研究、娱乐和自我观察参考");
  });
});
