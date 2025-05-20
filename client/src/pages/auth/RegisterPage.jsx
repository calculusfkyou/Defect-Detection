import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthHeader from '../../components/auth/AuthHeader';
import RegisterForm from '../../components/auth/RegisterForm';
import useAuth from '../../hooks/useAuth';

const RegisterPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // 如果用戶已登入，重定向到首頁
  if (isAuthenticated() && !loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <AuthHeader
        title="創建新帳戶"
        subtitle="已有帳戶？"
        linkText="立即登入"
        linkTo="/login"
      />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
