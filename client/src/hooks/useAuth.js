import { useContext } from 'react';
import { AuthContext } from '../components/contexts/AuthContext';

/**
 * 自定義Hook，提供認證功能
 * @returns {Object} 認證上下文的值
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // 🔧 直接返回 context，其中已包含 refreshUser 函數
  return context;
};

export default useAuth;
