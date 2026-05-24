import React from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface RequireAuthProps {
  children: React.ReactNode;
  minUserType?: number;
  message?: string;
}

export function RequireAuth({
  children,
  minUserType = 0,
  message,
}: RequireAuthProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user, openLoginModal } = useAuthStore();

  const userType = Number(user?.userType ?? 0);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 max-w-sm w-full">
          <AlertCircle className="w-14 h-14 text-blue-500 mx-auto mb-4" />

          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            请先登录
          </h2>

          <p className="text-gray-500 mb-6">
            {message || '登录后才能访问该页面。'}
          </p>

          <div className="flex gap-3">
            <button
              onClick={openLoginModal}
              className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              去登录
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex-1 px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (userType < minUserType) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 max-w-sm w-full">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />

          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            无权限访问
          </h2>

          <p className="text-gray-500 mb-6">
            {message || '该页面需要更高权限。'}
          </p>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireAuth;