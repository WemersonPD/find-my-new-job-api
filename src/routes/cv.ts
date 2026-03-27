import type { FastifyInstance } from "fastify";
import { extractCvText } from "@/shared/services/stirling";
import { requirePdfFile } from "@/shared/hooks/requirePdfFile";
import { success } from "@/shared/types/response";

export async function cvRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: requirePdfFile }, async (request) => {
    const fileBuffer = await request.uploadedFile.toBuffer();
    const text = await extractCvText(fileBuffer, request.uploadedFile.filename);

    return success({ text });
  });
}
