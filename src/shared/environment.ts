export const env = {
  // Server
  PORT: Number(process.env.PORT ?? 3000),
  HOST: String(process.env.HOST || "0.0.0.0"),
  CORS_ORIGIN: String(process.env.CORS_ORIGIN ?? "*"),

  // Stirling OCR
  STIRLING_URL: String(process.env.STIRLING_URL ?? "http://localhost:8080"),
  STIRLING_USERNAME: String(process.env.STIRLING_USERNAME ?? ""),
  STIRLING_PASSWORD: String(process.env.STIRLING_PASSWORD ?? ""),

  // Anthropic
  ANTHROPIC_API_KEY: String(process.env.ANTHROPIC_API_KEY ?? ""),

  // Apify
  APIFY_API_TOKEN: String(process.env.APIFY_API_TOKEN ?? ""),
  APIFY_MAX_POSTS: Number(process.env.APIFY_MAX_POSTS ?? 20),
};
