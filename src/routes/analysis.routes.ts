import type { FastifyInstance } from "fastify";
import type { AnalysisPayloadInput } from "../domain/types.js";
import { streamDeepSeekAnalysis, type AiAnalysisInput } from "../services/deepseek.service.js";
import { buildLlmAnalysisPayload } from "../services/llmPayload.service.js";
import { AiAnalysisInputSchema, AnalysisPayloadInputSchema, parseBody } from "./schemas.js";

export async function registerAnalysisRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/analysis/payload", {
    schema: {
      tags: ["analysis"],
      summary: "Build JSON-only LLM analysis payload"
    }
  }, async (request) => {
    const input = parseBody<AnalysisPayloadInput>(AnalysisPayloadInputSchema, request.body);
    return buildLlmAnalysisPayload(input);
  });

  app.post("/api/ai/deepseek-stream", {
    schema: {
      tags: ["analysis"],
      summary: "Stream an MCP-backed DeepSeek analysis"
    }
  }, async (request, reply) => {
    const input = parseBody<AiAnalysisInput>(AiAnalysisInputSchema, request.body);
    return streamDeepSeekAnalysis(reply, input);
  });
}
