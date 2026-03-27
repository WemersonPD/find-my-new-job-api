import { requirePdfFile } from "@/shared/hooks/requirePdfFile";
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
        summary: "Extract text from a CV",
        description:
          "Upload a PDF CV and receive its extracted text content. Supports both text-based PDFs and image-based PDFs (e.g. exported from Canva) via automatic OCR fallback.",
        consumes: ["multipart/form-data"],
        response: {
          200: {
            description: "Text successfully extracted",
            type: "object",
            properties: {
              ok: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  text: { type: "string", description: "Full extracted text content of the CV" },
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
      const text = await extractCvText(fileBuffer, request.uploadedFile.filename);

      return success({ text });
    },
  );
}
