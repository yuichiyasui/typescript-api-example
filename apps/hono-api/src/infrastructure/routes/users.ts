import { OpenAPIHono } from "@hono/zod-openapi";
import { setCookie, deleteCookie } from "hono/cookie";

import { registerUser, loginUser } from "../../application/service/users.js";
import type { Context } from "../context.js";
import { registerUserRoute, loginUserRoute, logoutUserRoute } from "../schemas/users.js";

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

app.openapi(loginUserRoute, async (c) => {
  const logger = c.get("logger");
  const body = c.req.valid("json");

  logger.info("User login attempt", { email: body.email });

  try {
    const result = await loginUser(
      { usersRepository: c.get("usersRepository") },
      body,
    );

    if (!result.success) {
      logger.warn({ errors: result.errors }, "User login failed");
      return c.json({ errors: result.errors }, 401);
    }

    setCookie(c, "accessToken", result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 60,
    });

    setCookie(c, "refreshToken", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    logger.info({ userId: result.user.id }, "User logged in successfully");
    return c.json({ user: result.user }, 200);
  } catch (error) {
    logger.error({ error }, "Failed to login user");
    throw error;
  }
});

app.openapi(logoutUserRoute, async (c) => {
  const logger = c.get("logger");

  logger.info("User logout attempt");

  deleteCookie(c, "accessToken");
  deleteCookie(c, "refreshToken");

  logger.info("User logged out successfully");
  return c.json({ message: "Logged out successfully" }, 200);
});

export const usersRoutes = app;
