import { z } from "zod/v4";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1, "NEXT_PUBLIC_API_URL is required"),
});

type Env = z.infer<typeof envSchema>;

const envObject: { [key in keyof Env]: string | undefined } = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

export const env = envSchema.parse(envObject);
