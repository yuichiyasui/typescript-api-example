import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import type { Context } from "../context.js";

import { usersRoutes } from "./users.js";

describe("POST /users/register", () => {
  it("正常なユーザー登録が成功する", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis(),
      level: "info",
      fatal: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      silent: vi.fn(),
    } as any;

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", mockLogger);
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

    const data = await response.json() as any;
    expect(data).toHaveProperty("userId");
    expect(typeof data.userId).toBe("string");

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockUsersRepository.save).toHaveBeenCalledOnce();
  });

  it("既存のメールアドレスでの登録は失敗する", async () => {
    const app = new Hono<Context>();

    const existingUser = { id: "existing-user" } as any;

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(existingUser),
      findById: vi.fn(),
    };

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis(),
      level: "info",
      fatal: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      silent: vi.fn(),
    } as any;

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", mockLogger);
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

    expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(mockUsersRepository.save).not.toHaveBeenCalled();
  });

  it("弱いパスワードでの登録は失敗する", async () => {
    const app = new Hono<Context>();

    const mockUsersRepository = {
      save: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
    };

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis(),
      level: "info",
      fatal: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      silent: vi.fn(),
    } as any;

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", mockLogger);
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

    const data = await response.json() as any;
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

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis(),
      level: "info",
      fatal: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      silent: vi.fn(),
    } as any;

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", mockLogger);
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

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis(),
      level: "info",
      fatal: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      silent: vi.fn(),
    } as any;

    app.use("*", (c, next) => {
      c.set("usersRepository", mockUsersRepository);
      c.set("logger", mockLogger);
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