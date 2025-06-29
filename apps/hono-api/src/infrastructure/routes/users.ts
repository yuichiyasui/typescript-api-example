import { OpenAPIHono } from "@hono/zod-openapi";

import { registerUser } from "../../application/service/users.js";
import type { Context } from "../context.js";
import { registerUserRoute } from "../schemas/users.js";

const app = new OpenAPIHono<Context>();

app.openapi(registerUserRoute, async (c) => {
  const logger = c.get("logger");
  const body = c.req.valid("json");

  logger.info("User registration attempt");

  try {
    const result = await registerUser(
      { usersRepository: c.get("usersRepository") },
      body,
    );

    if (!result.success) {
      logger.warn({ errors: result.errors }, "User registration failed");
      return c.json({ errors: result.errors }, 400);
    }

    logger.info({ userId: result.userId }, "User registered successfully");
    return c.json({ userId: result.userId }, 200);
  } catch (error) {
    logger.error({ error }, "Failed to register user");
    throw error;
  }
});

export const usersRoutes = app;
