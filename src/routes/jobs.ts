import { searchLinkedInPosts } from "@/shared/repositories/apify.repository";
import { matchJobsToCV } from "@/shared/repositories/claude.repository";
import { getSession } from "@/shared/repositories/session.repository";
import { failure, success } from "@/shared/types/response";
import type { FastifyInstance } from "fastify";

type JobMatchBody = {
  sessionToken: string;
  tags: string[];
};

export async function jobsRoutes(app: FastifyInstance) {
  app.post<{ Body: JobMatchBody }>(
    "/match",
    {
      schema: {
        tags: ["Jobs"],
        summary: "Match CV to job posts",
        description:
          "Provide a session token (from POST /cv) and optionally edited tags to receive a ranked list of matching LinkedIn job posts. Uses AI to rank results against your profile.",
        body: {
          type: "object",
          required: ["sessionToken", "tags"],
          properties: {
            sessionToken: {
              type: "string",
              format: "uuid",
              description: "Session token returned by POST /cv",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              description: "Search query tags (user-reviewed, may differ from AI-generated ones)",
            },
          },
        },
        response: {
          200: {
            description: "Matched jobs ranked by relevance",
            type: "object",
            properties: {
              ok: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  jobs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        company: { type: "string" },
                        description: { type: "string" },
                        url: { type: "string" },
                        matchScore: { type: "number", example: 92 },
                        matchReason: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Session not found or expired",
            type: "object",
            properties: {
              ok: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { sessionToken, tags } = request.body;

        const session = await getSession(request.server, sessionToken);
        if (!session) {
          reply.code(404);
          return failure("Session not found or expired. Please upload your CV again.");
        }

        const posts = await searchLinkedInPosts(tags);

        const jobs = await matchJobsToCV(session.cvText, posts);

        return success({ jobs });
      } catch (error) {
        return failure(
          error instanceof Error ? error.message : "An unknown error occurred while matching jobs.",
        );
      }
    },
  );
}
