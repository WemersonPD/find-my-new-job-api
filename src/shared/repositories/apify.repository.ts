import { env } from "@/shared/environment";
import { ApifyClient } from "apify-client";
import type { LinkedInPost } from "../types/job";

// Initialize the ApifyClient with your Apify API token
const client = new ApifyClient({
  token: env.APIFY_API_TOKEN,
});

/**
 * Fetch LinkedIn posts using Apify's LinkedIn Post Search Actor.
 *
 * Reference: https://docs.apify.com/api/client/js/docs
 */
export const searchLinkedInPosts = async (searchQueries: string[]) => {
  // Prepare Actor input
  const input = {
    searchQueries: searchQueries,
    maxPosts: env.APIFY_MAX_POSTS,
    scrapeReactions: false,
    postNestedReactions: false,
    scrapeComments: false,
    postNestedComments: false,
    contentType: "all", // "jobs" is too restrictive — many openings are shared as regular posts
    sortBy: "relevance",
    postedLimit: "month", // wider window to get more results; Claude filters by quality
  };

  // Run the Actor and wait for it to finish
  const run = await client.actor("harvestapi/linkedin-post-search").call(input);

  const { items: jobs } = await client.dataset(run.defaultDatasetId).listItems();

  return jobs.map((job): LinkedInPost => {
    const repost = job.repost as { content?: string; linkedinUrl?: string } | undefined;

    return {
      url: String(repost?.linkedinUrl ?? job.linkedinUrl),
      text: String(repost?.content ?? job.content),
    };
  });
};
