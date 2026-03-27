import { cvRoutes } from "@/routes/cv";
import { TEN_MB } from "@/shared/constants";
import { env } from "@/shared/environment";
import { errorHandler } from "@/shared/errorHandler";
import { success } from "@/shared/types/response";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import Fastify from "fastify";

const app = Fastify({ logger: true });

// OpenAPI spec
await app.register(swagger, {
  openapi: {
    info: {
      title: "Find My New Job API",
      description: "API for CV parsing and job matching",
      version: "0.1.0",
    },
    tags: [
      { name: "CV", description: "CV upload and text extraction" },
      { name: "System", description: "Health and status endpoints" },
    ],
  },
});

// Scalar UI at /docs
await app.register(scalar, {
  routePrefix: "/docs",
  configuration: {
    theme: "purple",
    title: "Find My New Job API",
    agent: {
      disabled: true,
    },
  },
});

// Plugins
await app.register(cors, { origin: env.CORS_ORIGIN });
await app.register(multipart, { limits: { fileSize: TEN_MB } });

app.setErrorHandler(errorHandler);

// Routes
app.register(cvRoutes, { prefix: "/cv" });
app.get(
  "/health",
  {
    schema: {
      tags: ["System"],
      summary: "Health check",
      description: "Returns the status of the API and its dependencies.",
      response: {
        200: {
          description: "All systems operational",
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                api: { type: "boolean", example: true },
                pdfParser: { type: "boolean", example: true },
              },
            },
          },
        },
      },
    },
  },
  async () => {
    return success({ api: true, pdfParser: true });
  },
);

await app.listen({ port: env.PORT, host: env.HOST });
