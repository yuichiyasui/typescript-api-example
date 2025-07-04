import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().openapi({ description: "プロジェクトID", example: "abc123" }),
  name: z
    .string()
    .openapi({ description: "プロジェクト名", example: "新しいプロジェクト" }),
  createdBy: z
    .string()
    .openapi({ description: "作成者ID", example: "user123" }),
});

export const CreateProjectRequestSchema = z.object({
  name: z
    .string()
    .min(1, "プロジェクト名は必須です")
    .max(255, "プロジェクト名は255文字以下で入力してください")
    .openapi({ description: "プロジェクト名", example: "新しいプロジェクト" }),
});

export const createProjectRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Projects"],
  summary: "新しいプロジェクトを作成",
  description: "新しいプロジェクトを作成します。管理者権限が必要です。",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateProjectRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ProjectSchema,
        },
      },
      description: "プロジェクトの作成に成功しました",
    },
    403: {
      description: "管理者権限が必要です",
    },
  },
});
