import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

/**
 * 私有路由組件，只允許已認證的用戶訪問
 */
const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading, authChecked, hasRole } = useAuth();
  const location = useLocation();

  // 如果認證檢查尚未完成，顯示加載指示器
  if (!authChecked || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 如果用戶未登入，重定向到登入頁面
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果有角色限制，檢查用戶是否有訪問權限
  if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  // 用戶已登入且有訪問權限，顯示受保護的路由
  return <Outlet />;
};

export default PrivateRoute;
