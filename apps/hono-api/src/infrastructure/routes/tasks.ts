import { Hono } from "hono";

import { listTasks } from "../../application/service/tasks.js";
import type { Context } from "../context.js";

const app = new Hono<Context>();

app.get("/", async (c) => {
  const logger = c.get("logger");
  
  logger.info("Fetching tasks list");
  
  try {
    const tasks = await listTasks({
      tasksRepository: c.get("tasksRepository"),
    });

    logger.info({ taskCount: tasks.length }, "Tasks retrieved successfully");

    return c.json({
      items: tasks,
    });
  } catch (error) {
    logger.error({ error }, "Failed to retrieve tasks");
    throw error;
  }
});

export const tasksRoutes = app;
