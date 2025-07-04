import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

import { UserRoleConstants } from "../../domain/value/role.js";

export const RegisterUserRequestSchema = z.object({
  name: z
    .string()
    .min(1)
    .openapi({ description: "ユーザー名", example: "田中太郎" }),
  email: z
    .string()
    .email()
    .openapi({ description: "メールアドレス", example: "tanaka@example.com" }),
  password: z.string().min(8).openapi({
    description:
      "パスワード（8文字以上128文字以下、大文字・小文字・数字・特殊文字を含む）",
    example: "StrongPassword123!",
    minLength: 8,
    maxLength: 128,
  }),
});

export const RegisterUserResponseSchema = z.object({
  userId: z
    .string()
    .openapi({ description: "作成されたユーザーID", example: "abc123" }),
});

export const RegisterUserErrorResponseSchema = z.object({
  errors: z.array(z.string()).openapi({ description: "エラーメッセージ" }),
});

export const registerUserRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Users"],
  summary: "ユーザー登録",
  description: `新しいユーザーを登録します。

パスワード要件:
- 8文字以上128文字以下
- 大文字を1文字以上含む
- 小文字を1文字以上含む  
- 数字を1文字以上含む
- 特殊文字を1文字以上含む (!@#$%^&*()_+-=[]{};"\\|,.<>/?)

新しいユーザーはデフォルトで「member」ロールが割り当てられます。`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterUserRequestSchema,
        },
      },
      description: "ユーザー登録情報",
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: RegisterUserResponseSchema,
        },
      },
      description: "ユーザー登録成功",
    },
    400: {
      content: {
        "application/json": {
          schema: RegisterUserErrorResponseSchema,
        },
      },
      description:
        "バリデーションエラー（パスワード要件違反、メールアドレス重複など）",
    },
  },
});

export const LoginUserRequestSchema = z.object({
  email: z
    .string()
    .email()
    .openapi({ description: "メールアドレス", example: "tanaka@example.com" }),
  password: z
    .string()
    .min(1)
    .openapi({ description: "パスワード", example: "StrongPassword123!" }),
});

export const LoginUserResponseSchema = z.object({
  user: z.object({
    id: z.string().openapi({ description: "ユーザーID", example: "abc123" }),
    name: z
      .string()
      .openapi({ description: "ユーザー名", example: "田中太郎" }),
    email: z.string().email().openapi({
      description: "メールアドレス",
      example: "tanaka@example.com",
    }),
    role: z.enum([UserRoleConstants.MEMBER, UserRoleConstants.ADMIN]).openapi({
      description: "ユーザーロール",
      example: UserRoleConstants.MEMBER,
    }),
  }),
});

export const LoginUserErrorResponseSchema = z.object({
  errors: z.array(z.string()).openapi({ description: "エラーメッセージ" }),
});

export const loginUserRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Users"],
  summary: "ユーザーログイン",
  description: `ユーザーのログインを行います。

認証に成功すると、アクセストークン（30分有効）とリフレッシュトークン（30日有効）が
HTTPOnlyクッキーとして設定されます。`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginUserRequestSchema,
        },
      },
      description: "ログイン情報",
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginUserResponseSchema,
        },
      },
      description: "ログイン成功",
    },
    401: {
      content: {
        "application/json": {
          schema: LoginUserErrorResponseSchema,
        },
      },
      description: "認証失敗（メールアドレスまたはパスワードが間違っています）",
    },
  },
});

export const LogoutUserResponseSchema = z.object({
  message: z.string().openapi({ description: "ログアウト完了メッセージ" }),
});

export const logoutUserRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["Users"],
  summary: "ユーザーログアウト",
  description: "ユーザーのログアウトを行い、認証クッキーをクリアします。",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LogoutUserResponseSchema,
        },
      },
      description: "ログアウト成功",
    },
  },
});
