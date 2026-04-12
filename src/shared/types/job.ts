export type LinkedInPost = {
  text: string;
  url: string;
};

export type SearchQueryResult = {
  queries: string[];
};

export type JobMatch = {
  title: string;
  company: string;
  description: string;
  url: string;
  matchScore: number;
  matchReason: string;
};
