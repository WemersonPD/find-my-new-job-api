import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { cvRoutes } from "@/routes/cv";
import { env } from "@/shared/environment";
import { errorHandler } from "@/shared/errorHandler";
import { TEN_MB } from "@/shared/constants";
import { success } from "@/shared/types/response";

const app = Fastify({ logger: true });

app.register(multipart, { limits: { fileSize: TEN_MB } });
app.setErrorHandler(errorHandler);

// Routes
app.register(cvRoutes, { prefix: "/cv" });
app.get("/health", async () => {
  return success({
    api: true,
    pdfParser: true,
  });
});

await app.listen({ port: env.PORT, host: env.HOST });
