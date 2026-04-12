import type { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";

export type SessionData = {
  cvText: string;
  tags: string[];
};

export async function createSession(
  app: FastifyInstance,
  data: SessionData,
  ttlSeconds: number,
): Promise<string> {
  const token = uuidv4();
  await app.redis.set(`session:${token}`, JSON.stringify(data), "EX", ttlSeconds);
  return token;
}

export async function getSession(app: FastifyInstance, token: string): Promise<SessionData | null> {
  const raw = await app.redis.get(`session:${token}`);
  if (!raw) return null;
  return JSON.parse(raw) as SessionData;
}
