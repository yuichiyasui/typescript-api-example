import { ProjectsList } from "@/components/ProjectsList";
import Link from "next/link";

interface ProjectsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { page = 1 } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          プロジェクト一覧
        </h1>
        <Link
          href="/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          新しいプロジェクトを作成
        </Link>
      </div>
      <ProjectsList page={Number(page)} limit={10} />
    </div>
  );
}
