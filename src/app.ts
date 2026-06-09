import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { registerAnalysisRoutes } from "./routes/analysis.routes.js";
import { registerCaseRoutes } from "./routes/case.routes.js";
import { registerChartRoutes } from "./routes/chart.routes.js";
import { registerFortuneRoutes } from "./routes/fortune.routes.js";
import { renderHomePage } from "./ui/page.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "ValidationError",
        issues: error.issues
      });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return reply.status(500).send({
      error: "InternalServerError",
      message
    });
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "ZiweiMaster Structured API",
        version: "0.1.0"
      }
    }
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  await registerChartRoutes(app);
  await registerFortuneRoutes(app);
  await registerAnalysisRoutes(app);
  await registerCaseRoutes(app);

  app.get("/", async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(renderHomePage());
  });
  app.get("/health", async () => ({ ok: true }));
  app.get("/openapi.json", async () => app.swagger());

  return app;
}
