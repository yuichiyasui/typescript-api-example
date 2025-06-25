import { serve } from "@hono/node-server";
import { Hono } from "hono";

import type { Context } from "./context.js";
import { env } from "./env.js";
import { TasksRepository } from "./repository/tasks-repository.js";
import { tasksRoutes } from "./routes/tasks.js";

const app = new Hono<Context>();
app.use("*", (c, next) => {
  c.set("tasksRepository", new TasksRepository());
  return next();
});

app.route("/tasks", tasksRoutes);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
