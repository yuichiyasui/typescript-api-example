"use client";

import { useGetProjectsQuery } from "@/__generated__/projects/projects";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  limit: number;
};

export function ProjectsList({ page, limit }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data } = useGetProjectsQuery({
    page,
    limit,
  });

  if (data?.status === 401) {
    return null;
  }

  if (!data) {
    return null;
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/projects?${params.toString()}`);
  };

  const renderPagination = () => {
    const { page, totalPages } = data.data.pagination;
    const pages = [];
    const maxVisiblePages = 5;

    // 開始ページと終了ページを計算
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 調整
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 前へボタン
    if (page > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(page - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
        >
          前へ
        </button>,
      );
    }

    // ページ番号
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border ${
            i === page
              ? "bg-blue-50 border-blue-500 text-blue-600"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>,
      );
    }

    // 次へボタン
    if (page < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(page + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
        >
          次へ
        </button>,
      );
    }

    return pages;
  };

  if (data.data.projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">参加しているプロジェクトはありません。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.data.projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {project.name}
            </h3>
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              プロジェクトを開く
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {data.data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <div className="flex items-center">{renderPagination()}</div>
          <div className="ml-4 text-sm text-gray-700">
            {data.data.pagination.total}件中{" "}
            {(data.data.pagination.page - 1) * data.data.pagination.limit + 1} -{" "}
            {Math.min(
              data.data.pagination.page * data.data.pagination.limit,
              data.data.pagination.total,
            )}{" "}
            件を表示
          </div>
        </div>
      )}
    </div>
  );
}
