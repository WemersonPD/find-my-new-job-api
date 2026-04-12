import { env } from "@/shared/environment";
import { requirePdfFile } from "@/shared/hooks/requirePdfFile";
import { generateSearchQueries } from "@/shared/repositories/claude.repository";
import { createSession } from "@/shared/repositories/session.repository";
import { extractCvText } from "@/shared/services/stirling";
import { success } from "@/shared/types/response";
import type { FastifyInstance } from "fastify";

export async function cvRoutes(app: FastifyInstance) {
  app.post(
    "/",
    {
      preHandler: requirePdfFile,
      schema: {
        tags: ["CV"],
        summary: "Extract text and generate search tags from a CV",
        description:
          "Upload a PDF CV and receive a session token plus AI-generated search tags. Supports both text-based PDFs and image-based PDFs (e.g. exported from Canva) via automatic OCR fallback. The session token is valid for 10 minutes and must be passed to the job matching endpoint.",
        consumes: ["multipart/form-data"],
        response: {
          200: {
            description: "CV processed and session created",
            type: "object",
            properties: {
              ok: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  sessionToken: {
                    type: "string",
                    format: "uuid",
                    description: "Session token to use for job matching (valid 10 min)",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "AI-generated search query tags based on your CV",
                  },
                },
              },
            },
          },
          400: {
            description: "No file uploaded or invalid request format",
            type: "object",
            properties: {
              ok: { type: "boolean", example: false },
              error: { type: "string", example: "No file uploaded" },
            },
          },
          413: {
            description: "File exceeds the 10MB size limit",
            type: "object",
            properties: {
              ok: { type: "boolean", example: false },
              error: { type: "string", example: "File exceeds the 10MB limit" },
            },
          },
          415: {
            description: "Unsupported file type — only PDFs are accepted",
            type: "object",
            properties: {
              ok: { type: "boolean", example: false },
              error: { type: "string", example: "Only PDF files are accepted" },
            },
          },
        },
      },
    },
    async (request) => {
      const fileBuffer = await request.uploadedFile.toBuffer();
      const cvText = await extractCvText(fileBuffer, request.uploadedFile.filename);

      const { queries } = await generateSearchQueries(cvText);

      const sessionToken = await createSession(
        request.server,
        { cvText, tags: queries },
        env.SESSION_TTL_SECONDS,
      );

      return success({ sessionToken, tags: queries });
    },
  );
}
