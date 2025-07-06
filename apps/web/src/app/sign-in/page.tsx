"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { postUsersLogin } from "@/lib/api";

const signInSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    mode: "onBlur",
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await postUsersLogin(data, {
        credentials: "include",
      });

      if (response.status === 200) {
        router.push("/");
      } else {
        setError("root", {
          message: response.data.errors.join(", "),
        });
      }
    } catch {
      setError("root", {
        message:
          "ログインに失敗しました。しばらく時間をおいて再度お試しください。",
      });
    }
  });

  const id = useId();
  const rootErrorId = `${id}-form`;
  const emailId = `${id}-email`;
  const emailErrorId = `${id}-email-error`;
  const passwordId = `${id}-password`;
  const passwordErrorId = `${id}-password-error`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            ログイン
          </h2>
        </div>
        <form
          onSubmit={onSubmit}
          aria-describedby={errors.root ? rootErrorId : undefined}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor={emailId}
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                {...register("email")}
                type="email"
                id={emailId}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-required
                aria-errormessage={emailErrorId}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p
                  id={emailErrorId}
                  role="alert"
                  className="text-red-600 text-sm mt-1"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={passwordId}
                className="block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                {...register("password")}
                type="password"
                id={passwordId}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-required
                aria-errormessage={passwordErrorId}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && (
                <p
                  id={passwordErrorId}
                  role="alert"
                  className="text-red-600 text-sm mt-1"
                >
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {errors.root && (
            <p
              id={rootErrorId}
              role="alert"
              className="text-red-600 text-sm text-center"
            >
              {errors.root.message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
