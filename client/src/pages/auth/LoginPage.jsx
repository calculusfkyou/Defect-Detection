import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthHeader from '../../components/auth/AuthHeader';
import LoginForm from '../../components/auth/LoginForm';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // 如果用戶已登入，重定向到首頁
  if (isAuthenticated() && !loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <AuthHeader
        title="登入您的帳戶"
        subtitle="還沒有帳戶？"
        linkText="立即註冊"
        linkTo="/register"
      />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
