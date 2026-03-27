import type { FastifyReply, FastifyRequest } from "fastify";

export async function requirePdfFile(request: FastifyRequest, reply: FastifyReply) {
  if (!request.isMultipart()) {
    return reply.status(400).send({ ok: false, error: "Request must be multipart/form-data" });
  }

  const data = await request.file();

  if (!data) {
    return reply.status(400).send({ ok: false, error: "No file uploaded" });
  }

  if (data.mimetype !== "application/pdf") {
    return reply.status(415).send({ ok: false, error: "Only PDF files are accepted" });
  }

  request.uploadedFile = data;
}
