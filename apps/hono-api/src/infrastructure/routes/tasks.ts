import { OpenAPIHono } from "@hono/zod-openapi";

import { listTasks } from "../../application/service/tasks.js";
import type { Context } from "../context.js";
import { listTasksRoute } from "../schemas/tasks.js";

const app = new OpenAPIHono<Context>();

app.openapi(listTasksRoute, async (c) => {
  const logger = c.get("logger");
  
  logger.info("Fetching tasks list");
  
  try {
    const tasks = await listTasks({
      tasksRepository: c.get("tasksRepository"),
    });

    logger.info({ taskCount: tasks.length }, "Tasks retrieved successfully");

    return c.json({
      items: tasks.map(task => ({
        id: task.id,
        name: task.name,
      })),
    });
  } catch (error) {
    logger.error({ error }, "Failed to retrieve tasks");
    throw error;
  }
});

export const tasksRoutes = app;
