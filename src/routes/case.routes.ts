import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  deleteStoredCase,
  getStoredCase,
  listStoredCases,
  saveStoredCase,
  type SaveCaseInput
} from "../services/caseStore.service.js";
import { parseBody } from "./schemas.js";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000)
});

const SaveCaseSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(80).optional(),
  birthInput: z.unknown(),
  uiState: z.unknown().optional(),
  analysisData: z.unknown().optional(),
  chatMessages: z.array(ChatMessageSchema).max(50).optional()
});

export async function registerCaseRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/cases", {
    schema: {
      tags: ["cases"],
      summary: "List saved Ziwei cases"
    }
  }, async () => ({
    cases: await listStoredCases()
  }));

  app.get<{ Params: { id: string } }>("/api/cases/:id", {
    schema: {
      tags: ["cases"],
      summary: "Get a saved Ziwei case"
    }
  }, async (request, reply) => {
    const item = await getStoredCase(request.params.id);
    if (!item) {
      return reply.status(404).send({ error: "NotFound", message: "Case not found" });
    }
    return item;
  });

  app.post("/api/cases", {
    schema: {
      tags: ["cases"],
      summary: "Create or update a saved Ziwei case"
    }
  }, async (request) => {
    const input = parseBody<SaveCaseInput>(SaveCaseSchema, request.body);
    return saveStoredCase(input);
  });

  app.delete<{ Params: { id: string } }>("/api/cases/:id", {
    schema: {
      tags: ["cases"],
      summary: "Delete a saved Ziwei case"
    }
  }, async (request, reply) => {
    const deleted = await deleteStoredCase(request.params.id);
    if (!deleted) {
      return reply.status(404).send({ error: "NotFound", message: "Case not found" });
    }
    return { ok: true };
  });
}
