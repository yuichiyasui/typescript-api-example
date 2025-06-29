"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { z } from "zod";

import { postUsersLogin } from "../../lib/api";

const signInSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signInSchema });
    },
    async onSubmit(event, { formData }) {
      event.preventDefault();
      setIsLoading(true);
      setSuccess("");

      try {
        const email = formData.get("email");
        const password = formData.get("password");

        if (
          !email ||
          !password ||
          typeof email !== "string" ||
          typeof password !== "string"
        ) {
          return;
        }

        const response = await postUsersLogin(
          {
            email,
            password,
          },
          {
            credentials: "include",
          },
        );

        if (response.status === 200) {
          setSuccess("ログインしました");
          form.reset();
        }
      } catch {
        // エラー時の処理
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            ログイン
          </h2>
        </div>
        <form {...getFormProps(form)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor={fields.email.id}
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                {...getInputProps(fields.email, { type: "email" })}
                autoComplete="email"
                aria-invalid={!!fields.email.errors}
                aria-errormessage={fields.email.errorId}
                aria-required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.email.errors && (
                <p
                  role="alert"
                  id={fields.email.errorId}
                  className="text-red-600 text-sm mt-1"
                >
                  {fields.email.errors.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={fields.password.id}
                className="block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                {...getInputProps(fields.password, { type: "password" })}
                autoComplete="current-password"
                aria-invalid={!!fields.password.errors}
                aria-errormessage={fields.password.errorId}
                aria-required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.password.errors && (
                <p
                  role="alert"
                  id={fields.password.errorId}
                  className="text-red-600 text-sm mt-1"
                >
                  {fields.password.errors.join(", ")}
                </p>
              )}
            </div>
          </div>

          {form.errors && (
            <div className="text-red-600 text-sm text-center">
              {form.errors.join(", ")}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/sign-up"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              アカウントをお持ちでない方はこちら
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
