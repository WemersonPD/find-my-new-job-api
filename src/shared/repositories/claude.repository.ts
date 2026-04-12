import { env } from "@/shared/environment";
import type { JobMatch, LinkedInPost, SearchQueryResult } from "@/shared/types/job";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function generateSearchQueries(cvText: string): Promise<SearchQueryResult> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this CV and return a JSON object with two fields:

1. "queries": array of 3 LinkedIn search queries to find relevant job posts.
   Rules for queries:
   - 3-5 keywords max each, NO quotes around them
   - Each query targets a different angle: role title, main tech stack, industry/domain
   - Include the seniority level (junior/mid/senior) in at least one query
   - If the candidate prefers remote, include "remote" in at least one query
   - LinkedIn search works best with fewer, well-chosen keywords — keep them concise

2. "preferences": object with:
   - "seniority": inferred from experience years and job titles ("junior" | "mid" | "senior" | "lead")
   - "workArrangement": inferred from CV or default to "remote" ("remote" | "hybrid" | "onsite" | "any")
   - "targetLocations": array of country/region names inferred from CV location or mentioned preferences (empty array if worldwide/not specified)

Return ONLY the JSON object, no explanation.

CV:
${cvText}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch)
    return {
      queries: [],
    };

  const parsed = JSON.parse(jsonMatch[0]) as {
    queries?: string[];
  };
  return {
    queries: parsed.queries ?? [],
  };
}

export async function matchJobsToCV(cvText: string, posts: LinkedInPost[]): Promise<JobMatch[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a job matching assistant. Given a CV and a list of LinkedIn posts, return only the posts that are real job openings matching the candidate's profile.

CV:
${cvText}

Posts:
${posts.map((p, i) => `[${i + 1}] ${p.url}\n${p.text}`).join("\n\n---\n\n")}

Return a JSON array. Each item: { title, company, description (max 200 chars), url, matchScore (0-100), matchReason (1 sentence) }
Skip posts that are not job openings or clearly don't match. Return [] if none match.`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "[]";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return jsonMatch ? (JSON.parse(jsonMatch[0]) as JobMatch[]) : [];
}
