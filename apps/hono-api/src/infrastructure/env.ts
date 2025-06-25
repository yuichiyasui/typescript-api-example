import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./local.db'),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  PORT: z.coerce.number().default(3000),
})

export const env = envSchema.parse(process.env)