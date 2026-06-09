import type { FastifyReply } from "fastify";
import type { AnalysisPayloadInput, FortuneLayer, PalaceName } from "../domain/types.js";
import { buildLlmAnalysisPayload } from "./llmPayload.service.js";
import { inspectPalace } from "../mcp/palaceInspection.js";
import {
  buildPlannerPrompt,
  defaultPlannerPlan,
  parsePlannerResponse,
  type AiPlannerPlan,
  type AiPlannerToolCall
} from "./aiPlanner.service.js";

export type ExpertProfile = "balanced" | "south" | "north" | "sanhe" | "feixing";
export type AnswerStyle = "plain" | "professional" | "mixed";
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiAnalysisInput = AnalysisPayloadInput & {
  question?: string;
  messages?: ChatMessage[];
  layer?: FortuneLayer;
  palaceName?: PalaceName;
  expertProfile?: ExpertProfile;
  answerStyle?: AnswerStyle;
  personalContext?: string;
  allowFollowup?: boolean;
};

type ClarificationDecision =
  | { action: "clarify"; question: string; reason: string }
  | { action: "answer"; reason: string };

function sendSse(reply: FastifyReply, event: string, data: unknown) {
  reply.raw.write(`event: ${event}\n`);
  reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
}

function expertInstruction(profile: ExpertProfile | undefined): string {
  const profileMap: Record<ExpertProfile, string> = {
    balanced: "采用综合派读法，兼顾三方四正、四化飞星、星曜组合和大限流年叠盘。",
    south: "采用南派侧重，重视三方四正、格局组合、庙旺落陷和星曜会照。",
    north:
      "采用北派侧重，重视四化飞星的能量流动：从发射宫与宫干出发，追踪禄权科忌所化星、落入宫位、对宫反冲、三方四正承接，以及生年/大限/流年/宫干之间的层级叠加。",
    sanhe: "采用三合派侧重，优先看本宫、对宫、三合宫、会照与格局成败。",
    feixing:
      "采用飞星派侧重，优先看生年四化、大限四化、流年四化与宫干飞化的能量轨迹：禄入、权入、科入、忌入、反冲、自化、向心/离心与多层四化串联。"
  };
  return profileMap[profile ?? "balanced"];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseClarificationDecision(text: string): ClarificationDecision {
  const fallback: ClarificationDecision = {
    action: "answer",
    reason: "追问判断不可解析，继续正式分析。"
  };
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return fallback;
  }
  if (!isRecord(parsed)) return fallback;
  const action = parsed.action === "clarify" ? "clarify" : "answer";
  const reason = typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim() : fallback.reason;
  if (action === "clarify") {
    const question = typeof parsed.question === "string" ? parsed.question.trim() : "";
    if (!question) return fallback;
    return {
      action,
      question: question.slice(0, 240),
      reason
    };
  }
  return { action, reason };
}

function styleInstruction(style: AnswerStyle | undefined): string {
  const styleMap: Record<AnswerStyle, string> = {
    plain: "用普通人能理解的话回答，少用术语；每个结论都翻译成现实生活中可能遇到的问题、机会或提醒。",
    professional: "用专业紫微语言回答，保留星曜、宫位、四化、庙旺落陷、三方四正和飞星术语，并说明推导依据。",
    mixed: "先给普通话结论，再补专业依据；避免只堆术语，也不要省略关键星曜和四化。"
  };
  return styleMap[style ?? "mixed"];
}

export function buildAnalysisPrompt(input: AiAnalysisInput, evidence: unknown): string {
  return [
    "你是资深国学易经术数顾问，专长为紫微斗数命盘分析。",
    "请只基于 MCP 工具返回的 JSON 数据分析，不要虚构不存在的星曜、宫位或四化。",
    "可综合参考三合紫微、飞星紫微、河洛紫微、钦天四化等方法论；但凡 MCP 证据里没有的星曜、宫位、四化、限流叠宫、神煞或时间信息，都必须标注为未提供，不能自行补盘。",
    expertInstruction(input.expertProfile),
    styleInstruction(input.answerStyle),
    "这是连续对话，不是一次性报告。必须结合对话历史、用户上一轮回答、个人补充背景和当前问题，避免重复追问已经回答过的信息。",
    input.allowFollowup
      ? "如果此前已经通过 clarification 事件追问并得到用户回答，本轮应把这些回答纳入判断；不要在正式长回答开头再堆一组追问。"
      : "不要主动追问，直接基于当前信息给出判断。",
    "回答要比普通摘要更深入：先判断用户真正关心的现实议题，再解释命盘证据如何指向这些议题。",
    "若用户问题是单一领域，聚焦该领域，但要补充与它强相关的宫位；若用户要求综合分析，则覆盖健康、学业、事业、财运、人际关系、婚姻感情等方面。",
    "关键事件必须尽量给出时间范围、吉凶属性、影响程度。时间范围优先使用 MCP Evidence 中的大限、流年、当前年份、叠宫或工具调度年份；没有明确时间证据时说“当前证据不足以细分到年份”。",
    "每个重要判断都要包含：现实表现、盘面依据、风险/机会等级、可执行建议。建议要具体，不要只说保持谨慎。",
    "专业回答要写星曜组合、庙旺落陷、三方四正、四化飞星、宫干引动、冲照关系；通俗回答要把这些翻译成普通人能理解的生活情境；混合回答先说人话，再给专业依据。",
    "北派或飞星分析必须单列【四化能量轨迹】：用“发射宫/宫干 → 化曜与四化类型 → 落入宫位 → 对宫反冲 → 三方四正承接 → 现实事件”的链路描述禄权科忌。不要只写静态落点；必须说明禄入带来资源、权入带来推动/控制、科入带来名声/缓冲、忌入带来卡点/牵引，以及反冲如何把压力投射到对宫。",
    "若 MCP Evidence 中有 palaceStemTransformations、layerTransformationTargetsInSanfang、transformationTargets 或 conflicts，必须优先用这些字段追踪四化能量流向；若缺少某段轨迹，要明确说该段证据不足。",
    "请输出中文，推荐结构：1. 总体结论 2. 关键宫位与星曜 3. 四化飞星与限流叠宫 4. 可能事件时间窗 5. 风险等级与建议 6. 免责声明。",
    "请控制在 1600 字以内，优先输出可被界面数据复核的结论。",
    "不要输出原始思维链；可以输出简短推理摘要。",
    "不要用宿命化、恐吓式语气；涉及健康、法律、投资、婚姻重大决策时，必须提醒这不是医疗、法律、投资或心理咨询建议。",
    "最后必须提醒：上述分析仅供研究、娱乐和自我观察参考，不能替代专业决策。",
    `用户问题：${input.question ?? "请示范分析当前盘面。"}。`,
    `个人补充背景：${input.personalContext?.trim() || "未提供"}。`,
    "对话历史 JSON:",
    JSON.stringify((input.messages || []).slice(-12)),
    "MCP Evidence JSON:",
    JSON.stringify(evidence)
  ].join("\n");
}

export function buildClarificationPrompt(input: AiAnalysisInput): string {
  return [
    "你是紫微斗数对话分析代理的追问控制器。你的任务不是解盘，而是在正式 MCP 取数和长回答之前，判断是否还需要先问用户一个现实背景问题。",
    "如果缺少的信息会显著改变判断方向，例如职业/收入模式、关系状态、具体选择、健康症状、投资/合作金额、时间范围、用户真正想解决的问题，就先追问。",
    "每次最多只问一个问题。问题必须具体、普通人能回答，不要一次列很多问题，不要输出紫微分析。",
    "如果对话历史里已经问过类似问题，或者用户刚刚回答了追问，优先进入正式回答，除非仍缺少一个关键分叉信息。",
    "最多连续追问 3 轮；如果历史中 assistant 已经连续追问 3 次，就必须 action=answer。",
    "如果用户明确要求直接看、先给结论、不要追问，必须 action=answer。",
    "返回 JSON，不要 Markdown。格式只能是：",
    '{"action":"clarify","question":"一个具体追问","reason":"为什么先问"}',
    "或",
    '{"action":"answer","reason":"为什么可以正式回答"}',
    "当前设置 JSON:",
    JSON.stringify({
      year: input.year,
      layer: input.layer,
      palaceName: input.palaceName,
      focusPalaces: input.focusPalaces,
      expertProfile: input.expertProfile,
      answerStyle: input.answerStyle,
      allowFollowup: input.allowFollowup,
      personalContext: input.personalContext
    }),
    "对话历史 JSON:",
    JSON.stringify((input.messages || []).slice(-12)),
    `当前用户问题：${input.question ?? "请基于当前盘面分析。"}`
  ].join("\n");
}

function summarizeInspection(inspected: ReturnType<typeof inspectPalace>) {
  return {
    selectedPalace: inspected.selectedPalace.name,
    attributes: inspected.selectedPalace.attributes,
    visualRelations: inspected.visualRelations,
    palaceStemTransformations: inspected.palaceStemTransformations.targets.map((item) => ({
      sourceStem: item.sourceStem,
      star: item.star,
      transformation: item.transformation,
      target: item.targetNatalPalace.palaceName,
      opposite: item.oppositeNatalPalace.palaceName
    }))
  };
}

async function requestPlannerPlan(apiKey: string, input: AiAnalysisInput, fallback: AiPlannerPlan): Promise<AiPlannerPlan> {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-pro",
      messages: [
        {
          role: "user",
          content: buildPlannerPrompt(input)
        }
      ],
      response_format: { type: "json_object" },
      stream: false,
      temperature: 0.1,
      max_tokens: 2600
    })
  });

  if (!response.ok) {
    return fallback;
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  return content ? parsePlannerResponse(content, fallback) : fallback;
}

async function requestClarificationDecision(apiKey: string, input: AiAnalysisInput): Promise<ClarificationDecision> {
  if (!input.allowFollowup) {
    return {
      action: "answer",
      reason: "用户关闭了先追问。"
    };
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-pro",
      messages: [
        {
          role: "user",
          content: buildClarificationPrompt(input)
        }
      ],
      response_format: { type: "json_object" },
      stream: false,
      temperature: 0.1,
      max_tokens: 900
    })
  });

  if (!response.ok) {
    return {
      action: "answer",
      reason: "追问判断请求失败，继续正式分析。"
    };
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  return content ? parseClarificationDecision(content) : { action: "answer", reason: "模型未返回追问判断。" };
}

function executePlannerTool(input: AiAnalysisInput, call: AiPlannerToolCall) {
  const shared = {
    ...input,
    year: call.year,
    focusPalaces: [call.palaceName],
    includeDecade: true,
    includeAnnual: true,
    includeSanfang: true,
    includeTransformations: true,
    includeConflicts: true
  };

  if (call.tool === "analysis_payload") {
    return {
      call,
      result: buildLlmAnalysisPayload(shared)
    };
  }

  return {
    call,
    result: inspectPalace({
      ...shared,
      layer: call.layer,
      palaceName: call.palaceName
    })
  };
}

function buildMcpEvidence(input: AiAnalysisInput, plan: AiPlannerPlan) {
  const toolResults = plan.toolCalls.map((call) => executePlannerTool(input, call));
  const primaryInspection =
    toolResults.find((item) => item.call.tool === "inspect_palace")?.result ??
    inspectPalace({
      ...input,
      year: plan.uiFocus.year,
      layer: plan.uiFocus.layer,
      palaceName: plan.uiFocus.palaceName
    });
  const primaryPayload =
    toolResults.find((item) => item.call.tool === "analysis_payload")?.result ??
    buildLlmAnalysisPayload({
      ...input,
      year: plan.uiFocus.year,
      focusPalaces: [plan.uiFocus.palaceName],
      includeDecade: true,
      includeAnnual: true,
      includeSanfang: true,
      includeTransformations: true,
      includeConflicts: true
    });

  return {
    plan,
    primaryPayload,
    primaryInspection,
    toolResults
  };
}

export async function streamDeepSeekAnalysis(reply: FastifyReply, input: AiAnalysisInput) {
  reply.raw.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "x-accel-buffering": "no"
  });
  reply.raw.flushHeaders?.();

  const apiKey = process.env.DEEPSEEK_API_KEY;
  sendSse(reply, "reasoning_summary", {
    step: "已收到问题，正在判断是否需要先追问现实背景。"
  });
  if (apiKey && input.allowFollowup) {
    const clarification = await requestClarificationDecision(apiKey, input);
    sendSse(reply, "reasoning_summary", {
      step: `追问判断：${clarification.reason}`
    });
    if (clarification.action === "clarify") {
      sendSse(reply, "clarification", {
        question: clarification.question,
        reason: clarification.reason
      });
      sendSse(reply, "done", {});
      reply.raw.end();
      return;
    }
  }

  sendSse(reply, "reasoning_summary", {
    step: "信息足够进入正式分析，正在让 AI Planner 理解你的意图和选择要读取的盘面。"
  });
  const fallbackPlan = defaultPlannerPlan(input);
  const plan = apiKey ? await requestPlannerPlan(apiKey, input, fallbackPlan) : fallbackPlan;
  sendSse(reply, "reasoning_summary", {
    step: "AI Planner 已完成调度计划，正在执行 MCP 盘面工具。"
  });
  const evidence = buildMcpEvidence(input, plan);
  const inspected = evidence.primaryInspection as ReturnType<typeof inspectPalace>;

  sendSse(reply, "routing", {
    ...plan.uiFocus,
    reason: `AI Planner：${plan.summary}`,
    toolCalls: plan.toolCalls.map((call) => ({
      tool: call.tool,
      layer: call.layer,
      palaceName: call.palaceName,
      year: call.year,
      reason: call.reason
    }))
  });
  sendSse(reply, "mcp", summarizeInspection(inspected));
  sendSse(reply, "reasoning_summary", {
    step: `DeepSeek 已先生成 MCP 调度计划，并执行 ${plan.toolCalls.length} 个盘面工具调用。`
  });

  if (!apiKey) {
    sendSse(reply, "error", {
      message: "DEEPSEEK_API_KEY is not set on the server process"
    });
    sendSse(reply, "done", {});
    reply.raw.end();
    return;
  }

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-pro",
      messages: [
        {
          role: "user",
          content: buildAnalysisPrompt(input, evidence)
        }
      ],
      stream: true,
      temperature: 0.2,
      max_tokens: 3600
    })
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    sendSse(reply, "error", {
      status: response.status,
      message: text.slice(0, 1000)
    });
    sendSse(reply, "done", {});
    reply.raw.end();
    return;
  }

  sendSse(reply, "reasoning_summary", {
    step: "DeepSeek 已开始流式阅读结构化命盘；页面只展示可审计摘要和最终内容，不展示原始隐藏思维链。"
  });

  const decoder = new TextDecoder();
  let buffer = "";
  let reasoningChars = 0;
  let answerChars = 0;
  let sentFirstReasoning = false;
  let nextReasoningMilestone = 300;
  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part
        .split("\n")
        .map((item) => item.trim())
        .find((item) => item.startsWith("data:"));
      if (!line) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      let parsed: { choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }> };
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }
      const delta = parsed.choices?.[0]?.delta;
      if (delta?.reasoning_content) {
        reasoningChars += delta.reasoning_content.length;
        if (!sentFirstReasoning || reasoningChars >= nextReasoningMilestone) {
          sentFirstReasoning = true;
          sendSse(reply, "reasoning_summary", {
            step: `模型正在推理盘面关系，已处理约 ${reasoningChars} 个推理字符。`
          });
          while (reasoningChars >= nextReasoningMilestone) {
            nextReasoningMilestone += 600;
          }
        }
      }
      if (delta?.content) {
        answerChars += delta.content.length;
        sendSse(reply, "answer_delta", {
          text: delta.content
        });
      }
    }
  }

  if (answerChars === 0) {
    sendSse(reply, "answer_delta", {
      text: "这次模型完成了内部推理，但没有返回正式回答内容。已保留 MCP 盘面调度结果，请再问一次或缩短问题；系统已经提高了输出预算来降低这个情况。"
    });
  }
  sendSse(reply, "done", {});
  reply.raw.end();
}
