import { serve } from "@hono/node-server";
import { Hono } from "hono";

import type { Context } from "./context.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { traceIdMiddleware } from "./middleware/trace-id.js";
import { TasksRepository } from "./repository/tasks-repository.js";
import { tasksRoutes } from "./routes/tasks.js";

const app = new Hono<Context>();

app.use("*", traceIdMiddleware);

app.use("*", (c, next) => {
  const traceId = c.get("traceId");
  const childLogger = logger.child({ traceId });
  
  c.set("logger", childLogger);
  c.set("tasksRepository", new TasksRepository());
  
  childLogger.info({
    method: c.req.method,
    path: c.req.path,
    userAgent: c.req.header("User-Agent"),
  }, "Request started");
  
  return next();
});

app.route("/tasks", tasksRoutes);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
