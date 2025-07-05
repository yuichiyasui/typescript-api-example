import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getProjects, getUsersUsersSelf } from '@/lib/api';
import { ProjectsList } from '@/components/ProjectsList';
import { Header } from '@/components/Header';

interface ProjectsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');

  // ログイン状態チェック
  if (!token) {
    redirect('/sign-in');
  }

  try {
    // ログインユーザー情報取得
    const userResponse = await getUsersUsersSelf({
      headers: {
        Cookie: `accessToken=${token.value}`,
      },
    });

    if (userResponse.status === 401) {
      redirect('/sign-in');
    }

    // プロジェクト一覧取得
    const params = await searchParams;
    const page = params.page ? parseInt(params.page) : 1;
    const limit = params.limit ? parseInt(params.limit) : 10;

    const projectsResponse = await getProjects(
      { page, limit },
      {
        headers: {
          Cookie: `accessToken=${token.value}`,
        },
      }
    );

    if (projectsResponse.status === 401) {
      redirect('/sign-in');
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={userResponse.data} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">プロジェクト一覧</h1>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              新しいプロジェクトを作成
            </Link>
          </div>
          <ProjectsList
            projects={projectsResponse.data.projects}
            pagination={projectsResponse.data.pagination}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Projects page error:', error);
    redirect('/sign-in');
  }
}