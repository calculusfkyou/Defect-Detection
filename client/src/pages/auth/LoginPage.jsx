import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-5 animate-pulse"></div>
      </div>

      {/* 主要內容 */}
      <div className="relative z-10">
        <AuthHeader
          title="歡迎回來"
          subtitle="還沒有帳戶？"
          linkText="立即註冊"
          linkTo="/register"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100 backdrop-blur-sm bg-opacity-95">
            <LoginForm />
          </div>

          {/* 頁腳資訊 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-gray-500">
              登入即表示您同意我們的{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                服務條款
              </a>{' '}
              和{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                隱私政策
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
