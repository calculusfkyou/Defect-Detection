import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400 to-green-400 rounded-full opacity-5 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-5 animate-pulse"></div>
      </div>

      {/* 主要內容 */}
      <div className="relative z-10">
        <AuthHeader
          title="加入我們"
          subtitle="已有帳戶？"
          linkText="立即登入"
          linkTo="/login"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur-sm bg-opacity-95">
            <RegisterForm />
          </div>

          {/* 頁腳資訊 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                免費使用
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                安全保護
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                快速檢測
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
