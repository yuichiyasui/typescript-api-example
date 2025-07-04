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

export const PaginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .openapi({ description: "ページ番号", example: 1 }),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .openapi({ description: "1ページあたりの件数", example: 10 }),
  total: z
    .number()
    .int()
    .min(0)
    .openapi({ description: "総件数", example: 25 }),
  totalPages: z
    .number()
    .int()
    .min(0)
    .openapi({ description: "総ページ数", example: 3 }),
});

export const PaginatedProjectsResponseSchema = z.object({
  projects: z.array(ProjectSchema).openapi({ description: "プロジェクト一覧" }),
  pagination: PaginationSchema.openapi({ description: "ページネーション情報" }),
});

export const getProjectsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Projects"],
  summary: "参加しているプロジェクト一覧を取得",
  description:
    "ユーザーが参加しているプロジェクトの一覧をページネーション付きで取得します。",
  request: {
    query: z.object({
      page: z.coerce
        .number()
        .int()
        .default(1)
        .transform(val => val <= 0 ? 1 : val)
        .openapi({ description: "ページ番号", example: 1 }),
      limit: z.coerce
        .number()
        .int()
        .default(10)
        .transform(val => val <= 0 ? 10 : val > 100 ? 100 : val)
        .openapi({ description: "1ページあたりの件数", example: 10 }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PaginatedProjectsResponseSchema,
        },
      },
      description: "プロジェクト一覧の取得に成功しました",
    },
    401: {
      description: "認証が必要です",
    },
  },
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
