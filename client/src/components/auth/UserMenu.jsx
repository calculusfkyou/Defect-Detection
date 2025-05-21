import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  // 點擊其他地方關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 處理登出
  const handleLogout = async () => {
    try {
      await logout();
      // 登出後自動重新導向首頁
      window.location.href = '/';
    } catch (error) {
      console.error('登出失敗', error);
    }
  };

  // 生成用戶頭像或預設圖示
  const renderAvatar = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }

    return (
      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {renderAvatar()}
        <span className="hidden md:block">{user?.name}</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-700 font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            個人資料
          </Link>

          <Link
            to="/history"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            檢測紀錄
          </Link>

          <Link
            to="/reports"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            報告管理
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              管理面板
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-100"
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
