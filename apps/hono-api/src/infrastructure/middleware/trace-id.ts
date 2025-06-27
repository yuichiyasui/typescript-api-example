import { createMiddleware } from "hono/factory";
import { nanoid } from "nanoid";

import type { Context } from "../context.js";

export const traceIdMiddleware = createMiddleware<Context>(async (c, next) => {
  const traceId = nanoid();
  c.set("traceId", traceId);
  
  c.header("X-Trace-Id", traceId);
  
  await next();
});