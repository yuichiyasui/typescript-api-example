import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import type { Context } from "../context.js";

import { tasksRoutes } from "./tasks.js";

describe("GET /tasks", () => {
  it("タスクリストを正常に返す", async () => {
    const app = new Hono<Context>();

    const mockTasksRepository = {
      findAll: vi.fn().mockReturnValue([
        {
          id: "task1",
          name: "Test Task 1",
          createdBy: "user1",
          updatedBy: "user1",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "task2",
          name: "Test Task 2",
          createdBy: "user2",
          updatedBy: "user2",
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ]),
    };

    app.use("*", (c, next) => {
      c.set("tasksRepository", mockTasksRepository);
      return next();
    });

    app.route("/tasks", tasksRoutes);

    const response = await app.request("/tasks", {
      method: "GET",
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      items: [
        {
          id: "task1",
          name: "Test Task 1",
          createdBy: "user1",
          updatedBy: "user1",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "task2",
          name: "Test Task 2",
          createdBy: "user2",
          updatedBy: "user2",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      ],
    });

    expect(mockTasksRepository.findAll).toHaveBeenCalledOnce();
  });

  it("タスクが存在しない場合は空配列を返す", async () => {
    const app = new Hono<Context>();

    const mockTasksRepository = {
      findAll: vi.fn().mockReturnValue([]),
    };

    app.use("*", (c, next) => {
      c.set("tasksRepository", mockTasksRepository);
      return next();
    });

    app.route("/tasks", tasksRoutes);

    const response = await app.request("/tasks", {
      method: "GET",
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      items: [],
    });

    expect(mockTasksRepository.findAll).toHaveBeenCalledOnce();
  });
});
