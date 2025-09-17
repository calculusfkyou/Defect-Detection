import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../../services/authService';

// 創建認證上下文
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 🔧 刷新當前用戶資料
  const refreshUser = useCallback(async () => {
    try {
      console.log('🔄 Context: 刷新用戶資料...');

      const result = await getCurrentUser();

      if (result.success) {
        setUser(result.user);
        console.log('✅ Context: 用戶資料刷新成功:', result.user);
        return { success: true };
      } else {
        console.log('⚠️ Context: 刷新用戶資料失敗:', result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('❌ Context: 刷新用戶資料錯誤:', error);
      return { success: false, message: error.message };
    }
  }, []);

  // 在組件掛載時檢查用戶是否已登入
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const result = await getCurrentUser();

        if (result.success) {
          setUser(result.user);
          console.log('✅ Context: 初始用戶狀態設置成功:', result.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        // 這是預期中的錯誤 - 用戶未登入，不需要作為錯誤處理
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []);

  // 🔧 用戶登入 - 登入成功後立即刷新用戶數據
  const login = async (email, password, rememberMe = false) => {
    try {
      setError(null);
      setLoading(true);

      console.log('🔑 Context: 開始登入流程...');
      const result = await loginUser({ email, password, rememberMe });

      if (result.success) {
        console.log('✅ Context: 登入API成功，獲取完整用戶數據...');

        // 🔧 登入成功後，立即獲取完整的用戶數據（包含頭像）
        try {
          const userResult = await getCurrentUser();
          if (userResult.success) {
            setUser(userResult.user);
            console.log('✅ Context: 完整用戶數據獲取成功:', userResult.user);
          } else {
            // 如果獲取完整數據失敗，使用登入返回的基本數據
            console.warn('⚠️ Context: 無法獲取完整用戶數據，使用登入返回的基本數據');
            setUser(result.user);
          }
        } catch (userError) {
          console.warn('⚠️ Context: 獲取完整用戶數據時發生錯誤，使用登入返回的基本數據');
          setUser(result.user);
        }

        return { success: true, user: result.user };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Context: 登入失敗:', err);
      setError(err.message || '登入失敗');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 🔧 用戶註冊 - 註冊成功後也獲取完整數據
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      console.log('📝 Context: 開始註冊流程...');
      const result = await registerUser(userData);

      if (result.success) {
        console.log('✅ Context: 註冊API成功，獲取完整用戶數據...');

        // 🔧 註冊成功後，立即獲取完整的用戶數據
        try {
          const userResult = await getCurrentUser();
          if (userResult.success) {
            setUser(userResult.user);
            console.log('✅ Context: 註冊後完整用戶數據獲取成功:', userResult.user);
          } else {
            setUser(result.user);
          }
        } catch (userError) {
          console.warn('⚠️ Context: 註冊後無法獲取完整用戶數據');
          setUser(result.user);
        }

        return { success: true, user: result.user };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Context: 註冊失敗:', err);
      setError(err.message || '註冊失敗');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 用戶登出
  const logout = async () => {
    try {
      console.log('🚪 Context: 開始登出流程...');
      await logoutUser();
      setUser(null);
      console.log('✅ Context: 用戶登出成功');
      return { success: true };
    } catch (err) {
      console.warn('⚠️ Context: 登出API失敗，但已清除本地狀態');
      setUser(null); // 即使登出API失敗，也清除本地狀態
      return { success: false, message: err.message };
    }
  };

  // 確認用戶是否已認證
  const isAuthenticated = () => {
    return !!user;
  };

  // 檢查用戶是否有特定角色
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // 提供給子組件的上下文值
  const value = {
    user,
    loading,
    error,
    authChecked,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
