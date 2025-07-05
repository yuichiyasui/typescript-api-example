import { OpenAPIHono } from "@hono/zod-openapi";

import {
  createProject,
  getProjectsByUserId,
} from "../../application/service/projects.js";
import { UserRole } from "../../domain/value/role.js";
import { authMiddleware } from "../auth/middleware.js";
import type { Context } from "../context.js";
import { createProjectRoute, getProjectsRoute } from "../schemas/projects.js";

const app = new OpenAPIHono<Context>();

app.use("*", authMiddleware);

app.openapi(getProjectsRoute, async (c) => {
  const logger = c.get("logger");
  const user = c.get("user")!;
  const { page, limit } = c.req.valid("query");

  logger.info({ userId: user.userId, page, limit }, "Getting projects list");

  try {
    const result = await getProjectsByUserId(
      {
        projectsRepository: c.get("projectsRepository"),
      },
      user.userId,
      page,
      limit,
    );

    logger.info(
      {
        userId: user.userId,
        projectCount: result.projects.length,
        totalCount: result.pagination.total,
      },
      "Projects retrieved successfully",
    );

    return c.json(result, 200);
  } catch (error) {
    logger.error({ error }, "Failed to get projects");
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.openapi(createProjectRoute, async (c) => {
  const logger = c.get("logger");
  const user = c.get("user")!;
  
  // 管理者権限をチェック
  if (!user || !UserRole.isAdminRole(user.role)) {
    logger.warn(
      { userId: user?.userId, role: user?.role },
      "Admin access required for project creation",
    );
    return c.json({ errors: ["Admin access required"] }, 403);
  }

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
