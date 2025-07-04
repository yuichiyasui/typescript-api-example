import { OpenAPIHono } from "@hono/zod-openapi";

import { createProject } from "../../application/service/projects.js";
import { adminMiddleware, authMiddleware } from "../auth/middleware.js";
import type { Context } from "../context.js";
import { createProjectRoute } from "../schemas/projects.js";

const app = new OpenAPIHono<Context>();

app.use("*", authMiddleware);

app.use(createProjectRoute.getRoutingPath(), adminMiddleware);

app.openapi(createProjectRoute, async (c) => {
  const logger = c.get("logger");
  const user = c.get("user")!;
  const { name } = c.req.valid("json");

  logger.info({ userId: user.userId, projectName: name }, "Creating project");

  try {
    const project = await createProject(
      {
        projectsRepository: c.get("projectsRepository"),
      },
      name,
      user.userId,
    );

    logger.info({ projectId: project.id }, "Project created successfully");

    return c.json(
      {
        id: project.id,
        name: project.name,
        createdBy: project.createdBy,
      },
      201,
    );
  } catch (error) {
    logger.error({ error }, "Failed to create project");
    throw error;
  }
});

export const projectsRoutes = app;