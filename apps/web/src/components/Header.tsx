'use client';

import { postUsersLogout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
}

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await postUsersLogout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
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
            <span className="text-sm text-gray-700">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}