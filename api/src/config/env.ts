import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("127.0.0.1"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().optional(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32).default("supersecretjwtkeythatisverylong123"),
  DEV_ADMIN_EMAIL: z.string().email().optional(),
  DEV_ADMIN_PASSWORD: z.string().min(6).optional(),
  DEV_ADMIN_NAME: z.string().min(2).optional(),
  DEV_COMPANY_NAME: z.string().min(2).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid API environment configuration. ${issues}`);
}

export const env = parsedEnv.data;
