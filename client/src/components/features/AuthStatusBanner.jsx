import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AuthStatusBanner({ isAuthenticated = false }) {
  if (isAuthenticated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>您正在使用訪客模式，檢測結果將不會儲存。</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/login" className="text-blue-700 font-medium hover:text-blue-900 underline">
            登入
          </Link>
          <span className="text-blue-700">或</span>
          <Link to="/register" className="text-blue-700 font-medium hover:text-blue-900 underline">
            註冊
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
