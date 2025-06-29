import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

import type { Context } from "./context.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import { traceIdMiddleware } from "./middleware/trace-id.js";
import { TasksRepository } from "./repository/tasks-repository.js";
import { UsersRepository } from "./repository/users-repository.js";
import { tasksRoutes } from "./routes/tasks.js";
import { usersRoutes } from "./routes/users.js";

const app = new OpenAPIHono<Context>();

app.use("*", traceIdMiddleware);

app.use("*", async (c, next) => {
  const traceId = c.get("traceId");
  const startTime = Date.now();
  const childLogger = logger.child({ traceId });

  c.set("logger", childLogger);
  c.set("tasksRepository", new TasksRepository());
  c.set("usersRepository", new UsersRepository());

  childLogger.info(
    {
      method: c.req.method,
      path: c.req.path,
      userAgent: c.req.header("User-Agent"),
    },
    "Request started",
  );

  await next();

  const duration = Date.now() - startTime;
  childLogger.info(
    {
      method: c.req.method,
      path: c.req.path,
      statusCode: c.res.status,
      duration: `${duration}ms`,
    },
    "Request completed",
  );
});

app.route("/tasks", tasksRoutes);
app.route("/users", usersRoutes);

// OpenAPI documentation endpoints
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Task API",
    version: "1.0.0",
    description: "A simple task management API",
  },
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

serve({
  fetch: app.fetch,
  port: env.PORT,
});
