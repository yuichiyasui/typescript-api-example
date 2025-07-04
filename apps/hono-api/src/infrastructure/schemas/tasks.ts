import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

// Task schemas
export const TaskSchema = z.object({
  id: z.string().openapi({ description: "タスクID", example: "abc123" }),
  name: z
    .string()
    .openapi({ description: "タスク名", example: "プロジェクトを完了する" }),
});

export const TasksListSchema = z.object({
  items: z.array(TaskSchema).openapi({ description: "タスクのリスト" }),
});

// Route definitions
export const listTasksRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Tasks"],
  summary: "すべてのタスクを取得",
  description: "すべてのタスクのリストを取得します",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: TasksListSchema,
        },
      },
      description: "タスクリストの取得に成功しました",
    },
  },
});
