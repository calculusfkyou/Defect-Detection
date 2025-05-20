import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../services/authService';

// 創建認證上下文
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 在組件掛載時檢查用戶是否已登入
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const { user } = await getCurrentUser();
        setUser(user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 用戶登入
  const login = async (email, password, rememberMe = false) => {
    try {
      setError(null);
      setLoading(true);
      const { user } = await loginUser({ email, password, rememberMe }); // 傳遞rememberMe
      setUser(user);
      return { success: true, user };
    } catch (err) {
      setError(err.message || '登入失敗');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 用戶註冊
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const { user } = await registerUser(userData);
      setUser(user);
      return { success: true, user };
    } catch (err) {
      setError(err.message || '註冊失敗');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // 用戶登出
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      return { success: true };
    } catch (err) {
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
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
