import { Hono } from "hono";

import { listTasks } from "../../application/service/tasks.js";
import type { Context } from "../context.js";

const app = new Hono<Context>();

app.get("/", (c) => {
  const tasks = listTasks({
    tasksRepository: c.get("tasksRepository"),
  });

  return c.json({
    items: tasks,
  });
});

export const tasksRoutes = app;
