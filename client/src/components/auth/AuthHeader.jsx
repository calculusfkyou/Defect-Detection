import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 認證頁面的標題組件
 */
const AuthHeader = ({ title, subtitle, linkText, linkTo }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sm:mx-auto sm:w-full sm:max-w-md text-center"
    >
      {/* Logo 和系統名稱 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-center items-center mb-6"
      >
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
          <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM8 17H5c-.55 0-1-.45-1-1v-2h4v3zm0-5H4v-2h4v2zm0-4H4V7h4v1zm8 9h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V7h6v1zm3 8h-1v-2h1v2zm0-4h-1v-2h1v2zm0-4h-1V7h1v1z" />
          </svg>
        </div>
        <div className="ml-3">
          <h1 className="text-2xl font-bold text-gray-900">PCB檢測系統</h1>
          <p className="text-sm text-gray-500">智能瑕疵檢測平台</p>
        </div>
      </motion.div>

      {/* 主標題 */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl font-bold text-gray-900 mb-2"
      >
        {title}
      </motion.h2>

      {/* 副標題和連結 */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-600 mb-8"
      >
        {subtitle}{' '}
        {linkText && linkTo && (
          <Link
            to={linkTo}
            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
          >
            {linkText}
          </Link>
        )}
      </motion.p>

      {/* 裝飾性分隔線 */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-8"
      />
    </motion.div>
  );
};

export default AuthHeader;
