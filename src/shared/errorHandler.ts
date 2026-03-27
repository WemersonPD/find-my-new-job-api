import { TEN_MB } from "@/shared/constants";
import { failure } from "@/shared/types/response";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  // @fastify/multipart file size exceeded
  if (error.code === "FST_REQ_FILE_TOO_LARGE") {
    return reply.status(413).send(failure(`File exceeds the ${TEN_MB}MB limit`));
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send(failure(error.message));
  }

  reply.log.error(error);
  return reply.status(500).send(failure("Internal server error"));
}
