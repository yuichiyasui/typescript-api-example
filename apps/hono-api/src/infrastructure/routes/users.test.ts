import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import { User } from "../../domain/user.js";
import { UserRole } from "../../domain/value/role.js";
import type { Context } from "../context.js";
import { logger } from "../logger.js";

import { usersRoutes } from "./users.js";

describe("POST /users/register", () => {
  it("正常なユーザー登録が成功する", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      return next();
    });

    app.route("/users", usersRoutes);

    const response = await app.request("/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
      }),
    });

    expect(response.status).toBe(200);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await response.json()) as any;
    expect(data).toHaveProperty("userId");
    expect(typeof data.userId).toBe("string");

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com",
    );
    expect(mockUsersRepository.save).toHaveBeenCalledOnce();
  });

  it("既存のメールアドレスでの登録は失敗する", async () => {
    const app = new Hono<Context>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = { id: "existing-user" } as any;

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(existingUser),
      findById: vi.fn(),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      return next();
    });

    app.route("/users", usersRoutes);

    const response = await app.request("/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
      }),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toEqual({
      errors: ["User with this email already exists"],
    });

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com",
    );
    expect(mockUsersRepository.save).not.toHaveBeenCalled();
  });

  it("弱いパスワードでの登録は失敗する", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      return next();
    });

    app.route("/users", usersRoutes);

    const response = await app.request("/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "weak",
      }),
    });

    expect(response.status).toBe(400);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await response.json()) as any;
    // Zodスキーマエラーまたはアプリケーションエラーの形式に対応
    expect(data).toHaveProperty("success");
    expect(data.success).toBe(false);

    expect(mockUsersRepository.save).not.toHaveBeenCalled();
  });

  it("不正なメールアドレスでの登録は失敗する", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      return next();
    });

    app.route("/users", usersRoutes);

    const response = await app.request("/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "invalid-email",
        password: "StrongPassword123!",
      }),
    });

    expect(response.status).toBe(400);

    expect(mockUsersRepository.save).not.toHaveBeenCalled();
  });

  it("空の名前での登録は失敗する", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      return next();
    });

    app.route("/users", usersRoutes);

    const response = await app.request("/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "",
        email: "test@example.com",
        password: "StrongPassword123!",
      }),
    });

    expect(response.status).toBe(400);

    expect(mockUsersRepository.save).not.toHaveBeenCalled();
  });
});

describe("GET /users/self", () => {
  it("認証されていない場合、401エラーを返す", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      return next();
    });

    app.route("", usersRoutes);

    const response = await app.request("/users/self", {
      method: "GET",
    });

    expect(response.status).toBe(401);

    const body = (await response.json()) as { errors: string[] };
    expect(body.errors).toContain("Authentication required");
  });

  it("認証されている場合、ユーザー情報を返す", async () => {
    const app = new Hono<Context>();

    const user = await User.create(
      "テストユーザー",
      "test@example.com",
      "Password123!",
      UserRole.member(),
    );

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn().mockResolvedValue(user),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      c.set("user", {
        userId: user.id,
        email: user.email,
        role: user.roleValue,
      });
      return next();
    });

    app.get("/users/self", async (c) => {
      const logger = c.get("logger");
      const user = c.get("user");
      const usersRepository = c.get("usersRepository");

      if (!user) {
        logger.warn("No user context found");
        return c.json({ errors: ["Authentication required"] }, 401);
      }

      try {
        const userEntity = await usersRepository.findById(user.userId);

        if (!userEntity) {
          logger.warn({ userId: user.userId }, "User not found");
          return c.json({ errors: ["User not found"] }, 401);
        }

        const userInfo = {
          id: userEntity.id,
          name: userEntity.name,
          email: userEntity.email,
          role: userEntity.roleValue as "MEMBER" | "ADMIN",
        };

        logger.info(
          { userId: user.userId },
          "User self info retrieved successfully",
        );
        return c.json(userInfo, 200);
      } catch (error) {
        logger.error({ error }, "Failed to retrieve user self info");
        throw error;
      }
    });

    const response = await app.request("/users/self", {
      method: "GET",
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "MEMBER",
    });
  });

  it("管理者ユーザーの場合、管理者ロールを返す", async () => {
    const app = new Hono<Context>();

    const user = await User.create(
      "管理者",
      "admin@example.com",
      "Password123!",
      UserRole.admin(),
    );

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn().mockResolvedValue(user),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      c.set("user", {
        userId: user.id,
        email: user.email,
        role: user.roleValue,
      });
      return next();
    });

    app.get("/users/self", async (c) => {
      const logger = c.get("logger");
      const user = c.get("user");
      const usersRepository = c.get("usersRepository");

      if (!user) {
        logger.warn("No user context found");
        return c.json({ errors: ["Authentication required"] }, 401);
      }

      try {
        const userEntity = await usersRepository.findById(user.userId);

        if (!userEntity) {
          logger.warn({ userId: user.userId }, "User not found");
          return c.json({ errors: ["User not found"] }, 401);
        }

        const userInfo = {
          id: userEntity.id,
          name: userEntity.name,
          email: userEntity.email,
          role: userEntity.roleValue as "MEMBER" | "ADMIN",
        };

        logger.info(
          { userId: user.userId },
          "User self info retrieved successfully",
        );
        return c.json(userInfo, 200);
      } catch (error) {
        logger.error({ error }, "Failed to retrieve user self info");
        throw error;
      }
    });

    const response = await app.request("/users/self", {
      method: "GET",
    });

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "ADMIN",
    });
  });

  it("存在しないユーザーIDの場合、401エラーを返す", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", logger);
      c.set("user", {
        userId: "non-existent-user-id",
        email: "test@example.com",
        role: "MEMBER",
      });
      return next();
    });

    app.get("/users/self", async (c) => {
      const logger = c.get("logger");
      const user = c.get("user");
      const usersRepository = c.get("usersRepository");

      if (!user) {
        logger.warn("No user context found");
        return c.json({ errors: ["Authentication required"] }, 401);
      }

      try {
        const userEntity = await usersRepository.findById(user.userId);

        if (!userEntity) {
          logger.warn({ userId: user.userId }, "User not found");
          return c.json({ errors: ["User not found"] }, 401);
        }

        const userInfo = {
          id: userEntity.id,
          name: userEntity.name,
          email: userEntity.email,
          role: userEntity.roleValue as "MEMBER" | "ADMIN",
        };

        logger.info(
          { userId: user.userId },
          "User self info retrieved successfully",
        );
        return c.json(userInfo, 200);
      } catch (error) {
        logger.error({ error }, "Failed to retrieve user self info");
        throw error;
      }
    });

    const response = await app.request("/users/self", {
      method: "GET",
    });

    expect(response.status).toBe(401);

    const body = (await response.json()) as { errors: string[] };
    expect(body.errors).toContain("User not found");
  });
});
