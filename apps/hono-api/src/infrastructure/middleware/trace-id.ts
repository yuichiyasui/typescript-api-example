import { createMiddleware } from "hono/factory";
import { nanoid } from "nanoid";

import type { Context } from "../context.js";

export const traceIdMiddleware = createMiddleware<Context>(async (c, next) => {
  const traceId = nanoid();
  const startTime = Date.now();
  
  c.set("traceId", traceId);
  c.set("startTime", startTime);
  
  c.header("X-Trace-Id", traceId);
  
  await next();
});