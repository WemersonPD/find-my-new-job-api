import { requirePdfFile } from "@/shared/hooks/requirePdfFile";
import { searchLinkedInPosts } from "@/shared/repositories/apify.repository";
import { generateSearchQueries, matchJobsToCV } from "@/shared/repositories/claude.repository";
import { extractCvText } from "@/shared/services/stirling";
import { failure, success } from "@/shared/types/response";
import type { FastifyInstance } from "fastify";

export async function jobsRoutes(app: FastifyInstance) {
  app.post(
    "/match",
    {
      preHandler: requirePdfFile,
      schema: {
        tags: ["Jobs"],
        summary: "Match CV to job posts",
        description:
          "Upload a CV PDF and receive a ranked list of matching LinkedIn job posts. Uses AI to generate search queries and rank results against your profile.",
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
        },
      },
    },
    async (request) => {
      try {
        const fileBuffer = await request.uploadedFile.toBuffer();
        const cvText = await extractCvText(fileBuffer, request.uploadedFile.filename);

        const { queries } = await generateSearchQueries(cvText);

        const posts = await searchLinkedInPosts(queries);

        const jobs = await matchJobsToCV(cvText, posts);

        return success({ jobs });
      } catch (error) {
        return failure(
          error instanceof Error
            ? error.message
            : "An unknown error occurred while processing the CV.",
        );
      }
    },
  );
}
