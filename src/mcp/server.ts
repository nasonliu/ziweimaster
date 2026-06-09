import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PALACE_ORDER } from "../domain/constants.js";
import { getNatalChart } from "../services/chart.service.js";
import { getAnnualFortune, getDecades } from "../services/horoscope.service.js";
import { buildLlmAnalysisPayload } from "../services/llmPayload.service.js";
import { getChinaCityLibrary } from "../services/place.service.js";
import { inspectPalace } from "./palaceInspection.js";
import { parseNaturalLanguageBirthInput } from "./textParser.js";
import type { AnalysisPayloadInput, AnnualInput, BirthInput, PalaceName } from "../domain/types.js";
import type { InspectPalaceInput } from "./palaceInspection.js";

const PalaceNameSchema: z.ZodType<PalaceName> = z.enum(PALACE_ORDER as [PalaceName, ...PalaceName[]]);

const BirthInputSchema = {
  gender: z.enum(["male", "female"]).describe("性别：male 男，female 女"),
  birthDateTime: z.string().describe("ISO 时间，例如 1981-06-20T00:30:00+08:00"),
  calendarType: z.enum(["solar", "lunar"]).describe("solar 阳历，lunar 阴历"),
  trueSolarTime: z.boolean().optional().describe("是否使用真太阳时"),
  longitude: z.number().optional().describe("手动经度；若省市可解析，可不填"),
  latitude: z.number().optional().describe("纬度，可选"),
  birthPlaceProvince: z.string().optional().describe("中国省级行政区，例如 北京市、广东省"),
  birthPlaceCity: z.string().optional().describe("中国地级市，例如 北京市、广州市"),
  timezone: z.string().optional().describe("时区名，例如 Asia/Shanghai"),
  name: z.string().optional(),
  locale: z.enum(["zh-CN", "zh-TW", "en"]).optional()
};

function jsonToolResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function buildZiweiMcpServer() {
  const server = new McpServer({
    name: "ziweimaster",
    version: "0.1.0"
  });

  server.registerTool(
    "ziweimaster_get_china_places",
    {
      title: "获取中国地级市地址库",
      description: "返回页面同款中国省份/地级市中心点经纬度库，用于真太阳时经度解析。"
    },
    async () => jsonToolResult(getChinaCityLibrary())
  );

  server.registerTool(
    "ziweimaster_natal_chart",
    {
      title: "生成本命盘",
      description: "输入出生资料，返回完整本命十二宫、星曜亮度、干支、四化和关系映射。",
      inputSchema: BirthInputSchema
    },
    async (input) => jsonToolResult(getNatalChart(input as BirthInput))
  );

  server.registerTool(
    "ziweimaster_decades",
    {
      title: "生成大限盘",
      description: "输入出生资料，返回十二个大限、每个大限十二宫映射、四化、飞星落点和三方四正。",
      inputSchema: BirthInputSchema
    },
    async (input) => jsonToolResult({ decades: getDecades(input as BirthInput) })
  );

  server.registerTool(
    "ziweimaster_annual_fortune",
    {
      title: "生成流年盘",
      description: "输入出生资料和年份，返回指定年份流年盘、大限叠加、三层叠宫、四化和飞星落点。",
      inputSchema: {
        ...BirthInputSchema,
        year: z.number().int().min(1900).max(2200).describe("要生成的流年年份")
      }
    },
    async (input) => jsonToolResult(getAnnualFortune(input as AnnualInput))
  );

  server.registerTool(
    "ziweimaster_analysis_payload",
    {
      title: "生成 LLM 分析 Payload",
      description: "生成 API/页面同款 LLM 结构化材料。只返回 JSON，不做玄学长文解释。",
      inputSchema: {
        ...BirthInputSchema,
        year: z.number().int().min(1900).max(2200).optional(),
        focusPalaces: z.array(PalaceNameSchema).optional(),
        includeDecade: z.boolean().optional(),
        includeAnnual: z.boolean().optional(),
        includeSanfang: z.boolean().optional(),
        includeTransformations: z.boolean().optional(),
        includeConflicts: z.boolean().optional()
      }
    },
    async (input) => jsonToolResult(buildLlmAnalysisPayload(input as AnalysisPayloadInput))
  );

  server.registerTool(
    "ziweimaster_inspect_palace",
    {
      title: "点击/检查某个宫位",
      description:
        "等价于页面点击某个宫位。返回该宫位可见信息、干支阴阳五行、星曜亮度、三方四正、实线/虚线关系、大限/流年叠加、四化飞星和该宫宫干引发的四化落点。",
      inputSchema: {
        ...BirthInputSchema,
        year: z.number().int().min(1900).max(2200),
        layer: z.enum(["natal", "decade", "annual"]).optional().describe("要查看的盘层：本命/大限/流年"),
        palaceName: PalaceNameSchema.optional().describe("要点击/检查的宫位"),
        palaceId: z.number().int().min(0).max(11).optional().describe("也可以用 0-11 宫位索引")
      }
    },
    async (input) => jsonToolResult(inspectPalace(input as InspectPalaceInput))
  );

  server.registerTool(
    "ziweimaster_from_text",
    {
      title: "从自然语言生成结构化盘面",
      description:
        "用户可以直接说中文，例如：男，1981年6月20日0点30分，北京出生，用真太阳时，看2026年子女宫。本工具会解析文字、生成 LLM payload，并自动 inspect 关注宫位。",
      inputSchema: {
        text: z.string().describe("中文自然语言出生资料和问题"),
        layer: z.enum(["natal", "decade", "annual"]).optional().describe("希望检查的盘层，默认 annual"),
        palaceName: PalaceNameSchema.optional().describe("可覆盖自然语言中识别的关注宫位")
      }
    },
    async ({ text, layer, palaceName }) => {
      const parsed = parseNaturalLanguageBirthInput(text);
      const year = parsed.year ?? new Date().getFullYear();
      const focusPalace = (palaceName ?? parsed.focusPalaces?.[0] ?? "命宫") as PalaceName;
      return jsonToolResult({
        parsedInput: parsed,
        analysisPayload: buildLlmAnalysisPayload({
          ...parsed,
          year,
          focusPalaces: [focusPalace],
          includeDecade: true,
          includeAnnual: true,
          includeSanfang: true,
          includeTransformations: true,
          includeConflicts: true
        }),
        inspectedPalace: inspectPalace({
          ...parsed,
          year,
          layer: layer ?? "annual",
          palaceName: focusPalace
        })
      });
    }
  );

  server.registerPrompt(
    "ziweimaster_reading_prompt",
    {
      title: "紫微结构化分析提示词",
      description: "让模型先调用 ZiweiMaster MCP tools，再基于结构化 JSON 做分析。",
      argsSchema: {
        userQuestion: z.string().describe("用户自然语言问题")
      }
    },
    ({ userQuestion }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `用户问题：${userQuestion}\n\n` +
              "请先调用 ziweimaster_from_text 或 ziweimaster_analysis_payload / ziweimaster_inspect_palace 获取结构化命盘数据。不要凭空解释；所有宫位、星曜、四化、三方四正、大限/流年叠加都以工具返回 JSON 为准。"
          }
        }
      ]
    })
  );

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = buildZiweiMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
