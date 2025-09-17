import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout, refreshUser } = useAuth();

  // 🔧 監聽用戶狀態變化，確保頭像正確顯示
  useEffect(() => {
    console.log('🔄 UserMenu: 用戶狀態更新:', user);

    // 如果用戶已登入但沒有頭像數據，嘗試刷新用戶數據
    if (user && user.id && !user.avatar) {
      console.log('⚠️ UserMenu: 用戶缺少頭像數據，嘗試刷新...');
      refreshUser();
    }
  }, [user, refreshUser]);

  // 🔧 確保用戶頭像正確顯示
  const getAvatarContent = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn('⚠️ UserMenu: 頭像載入失敗，顯示預設頭像');
            // 如果頭像載入失敗，隱藏圖片並顯示預設頭像
            e.target.style.display = 'none';
            const fallback = e.target.nextSibling;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
          onLoad={() => {
            console.log('✅ UserMenu: 頭像載入成功');
          }}
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  // 🔧 獲取下拉選單中的頭像內容
  const getDropdownAvatarContent = () => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn('⚠️ UserMenu: 下拉選單頭像載入失敗');
            e.target.style.display = 'none';
            const fallback = e.target.nextSibling;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  // 點擊外部關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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
      console.log('🚪 UserMenu: 用戶請求登出...');
      await logout();
      setIsOpen(false);
      // 登出後重定向到首頁
      window.location.href = '/';
    } catch (error) {
      console.error('❌ UserMenu: 登出失敗:', error);
    }
  };

  // 🔧 如果沒有用戶數據，顯示載入狀態
  if (!user) {
    return (
      <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse"></div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* 用戶頭像按鈕 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="relative">
          {/* 🔧 頭像容器 */}
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
            {getAvatarContent()}
            {/* 備用顯示 - 當圖片載入失敗時 */}
            <div
              className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold"
              style={{ display: 'none' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>

          {/* 在線狀態指示器 */}
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
        </div>

        {/* 用戶名稱和角色 */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white truncate max-w-32">
            {user.name}
          </p>
          <p className="text-xs text-gray-400">
            {user.role === 'admin' ? '管理員' : '用戶'}
          </p>
        </div>

        {/* 下拉箭頭 */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* 下拉選單 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          >
            {/* 用戶資訊區域 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
                  {getDropdownAvatarContent()}
                  {/* 備用顯示 */}
                  <div
                    className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold"
                    style={{ display: 'none' }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${user.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'}
                    `}>
                      {user.role === 'admin' ? '管理員' : '一般用戶'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 選單項目 */}
            <div className="py-1">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                個人資料
              </Link>

              <Link
                to="/history"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                檢測記錄
              </Link>

              {user.role === 'admin' && (
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    系統管理
                  </Link>
                </>
              )}

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                登出
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
