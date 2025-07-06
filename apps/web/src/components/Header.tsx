"use client";

import {
  useGetUsersSelfQuery,
  usePostUsersLogoutMutation,
} from "@/__generated__/users/users";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export function Header() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { data } = useGetUsersSelfQuery({
    query: {
      enabled: !isPending,
    },
  });

  const queryClient = useQueryClient();
  const { mutateAsync: logoutMutate } = usePostUsersLogoutMutation();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutMutate();
        router.push("/sign-in");
        queryClient.removeQueries();
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              プロジェクト管理
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {data?.status === 200 && (
              <>
                <span className="text-sm text-gray-700">{data.data.name}</span>
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isPending ? "ログアウト中..." : "ログアウト"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
