import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";

import type { Context } from "../context.js";

import { verifyAccessToken } from "./jwt.js";

export const authMiddleware: MiddlewareHandler<Context> = async (
  c,
  next,
): Promise<Response | void> => {
  const logger = c.get("logger");
  const accessToken = getCookie(c, "accessToken");

  if (!accessToken) {
    logger.warn("No access token provided");
    return c.json({ errors: ["Authentication required"] }, 401);
  }

  const payload = verifyAccessToken(accessToken);
  if (!payload) {
    logger.warn("Invalid access token");
    return c.json({ errors: ["Invalid or expired token"] }, 401);
  }

  c.set("user", {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  await next();
};

export const optionalAuthMiddleware: MiddlewareHandler<Context> = async (
  c,
  next,
) => {
  const accessToken = getCookie(c, "accessToken");

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      c.set("user", {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });
    }
  }

  await next();
};

export const adminMiddleware: MiddlewareHandler<Context> = async (
  c,
  next,
): Promise<Response | void> => {
  const logger = c.get("logger");
  const user = c.get("user");

  if (!user) {
    logger.warn("No user context found");
    return c.json({ errors: ["Authentication required"] }, 401);
  }

  if (user.role !== "2") {
    logger.warn({ userId: user.userId, role: user.role }, "Admin access required");
    return c.json({ errors: ["Admin access required"] }, 403);
  }

  await next();
};
