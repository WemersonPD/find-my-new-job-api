export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  HOST: String(process.env.HOST || "0.0.0.0"),
  STIRLING_URL: process.env.STIRLING_URL ?? "http://localhost:8080",
  STIRLING_USERNAME: process.env.STIRLING_USERNAME ?? "",
  STIRLING_PASSWORD: process.env.STIRLING_PASSWORD ?? "",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
};
