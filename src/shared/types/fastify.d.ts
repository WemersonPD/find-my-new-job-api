import type { MultipartFile } from "@fastify/multipart";

declare module "fastify" {
  interface FastifyRequest {
    uploadedFile: MultipartFile;
  }
}
