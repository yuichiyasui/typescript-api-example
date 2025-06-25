import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "../env.js";

import * as schema from "./schema.js";

const client = createClient({
  url: env.DATABASE_URL,
  ...(env.DATABASE_AUTH_TOKEN && { authToken: env.DATABASE_AUTH_TOKEN }),
});

export const db = drizzle(client, { schema });
