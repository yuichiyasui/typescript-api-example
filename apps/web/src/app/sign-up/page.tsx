"use client";

import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { z } from "zod";

import { postUsersRegister } from "../../lib/api";

const signUpSchema = z
  .object({
    name: z.string().min(1, "名前を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(8, "パスワードは8文字以上で入力してください"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
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

        if (
          !name ||
          !email ||
          !password ||
          typeof name !== "string" ||
          typeof email !== "string" ||
          typeof password !== "string"
        ) {
          return;
        }

        const response = await postUsersRegister(
          {
            name,
            email,
            password,
          },
          {
            credentials: "include",
          },
        );

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
              <label
                htmlFor={fields.name.id}
                className="block text-sm font-medium text-gray-700"
              >
                名前
              </label>
              <input
                {...getInputProps(fields.name, { type: "text" })}
                aria-invalid={!!fields.name.errors}
                aria-errormessage={fields.name.errorId}
                aria-required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.name.errors && (
                <p
                  role="alert"
                  id={fields.name.errorId}
                  className="text-red-600 text-sm mt-1"
                >
                  {fields.name.errors.join(", ")}
                </p>
              )}
            </div>

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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                autoComplete="new-password"
                aria-invalid={!!fields.password.errors}
                aria-errormessage={fields.password.errorId}
                aria-required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                <p>パスワードは以下の条件を満たす必要があります：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>8文字以上128文字以下</li>
                  <li>大文字・小文字・数字・特殊文字をそれぞれ1文字以上含む</li>
                  <li>
                    使用可能な特殊文字: ! @ # $ % ^ & * ( ) _ + - = [ ] {`{`}{" "}
                    {`}`} ; &apos; : &quot; \ | , . &lt; &gt; / ?
                  </li>
                </ul>
              </div>
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

            <div>
              <label
                htmlFor={fields.confirmPassword.id}
                className="block text-sm font-medium text-gray-700"
              >
                パスワード確認
              </label>
              <input
                {...getInputProps(fields.confirmPassword, {
                  type: "password",
                  ariaAttributes: true,
                })}
                aria-invalid={!!fields.confirmPassword.errors}
                aria-errormessage={fields.confirmPassword.errorId}
                aria-required
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {fields.confirmPassword.errors && (
                <p
                  role="alert"
                  id={fields.confirmPassword.errorId}
                  className="text-red-600 text-sm mt-1"
                >
                  {fields.confirmPassword.errors.join(", ")}
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
