import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./local.db'),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)