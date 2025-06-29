"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { z } from "zod";

import { postUsersRegister } from "../../lib/api.js";

const signUpSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signUpSchema });
    },
    async onSubmit(event, { formData }) {
      event.preventDefault();
      setIsLoading(true);
      setSuccess("");

      try {
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");

        if (!name || !email || !password || typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
          return;
        }

        const response = await postUsersRegister({
          name,
          email,
          password,
        }, {
          credentials: "include",
        });

        if (response.status === 200) {
          setSuccess("ユーザー登録が完了しました");
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
            ユーザー登録
          </h2>
        </div>
        <form {...getFormProps(form)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor={fields.name.id} className="block text-sm font-medium text-gray-700">
                名前
              </label>
              <input
                {...getInputProps(fields.name, { type: "text" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.name.errors && (
                <div className="text-red-600 text-sm mt-1">
                  {fields.name.errors.join(", ")}
                </div>
              )}
            </div>

            <div>
              <label htmlFor={fields.email.id} className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                {...getInputProps(fields.email, { type: "email" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.email.errors && (
                <div className="text-red-600 text-sm mt-1">
                  {fields.email.errors.join(", ")}
                </div>
              )}
            </div>

            <div>
              <label htmlFor={fields.password.id} className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                {...getInputProps(fields.password, { type: "password" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.password.errors && (
                <div className="text-red-600 text-sm mt-1">
                  {fields.password.errors.join(", ")}
                </div>
              )}
            </div>

            <div>
              <label htmlFor={fields.confirmPassword.id} className="block text-sm font-medium text-gray-700">
                パスワード確認
              </label>
              <input
                {...getInputProps(fields.confirmPassword, { type: "password" })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.confirmPassword.errors && (
                <div className="text-red-600 text-sm mt-1">
                  {fields.confirmPassword.errors.join(", ")}
                </div>
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
              {isLoading ? "登録中..." : "登録する"}
            </button>
          </div>

          <div className="text-center">
            <a
              href="/sign-in"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              既にアカウントをお持ちの方はこちら
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}