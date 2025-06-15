import React from 'react';
import { motion } from 'framer-motion';

const PaginationModeToggle = ({
  currentMode,
  onToggle,
  loading = false
}) => {
  const modes = [
    {
      value: 'infinite',
      label: '無限滾動',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ),
      description: '點擊載入更多記錄'
    },
    {
      value: 'pages',
      label: '分頁瀏覽',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: '傳統分頁切換'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border p-4 mb-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 左側：說明 */}
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">瀏覽模式</span>
        </div>

        {/* 右側：模式切換按鈕 */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {modes.map((mode) => (
            <motion.button
              key={mode.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !loading && onToggle()}
              disabled={loading}
              className={`
                relative flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md
                transition-all duration-200 min-w-0
                ${currentMode === mode.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : loading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {/* 圖標 */}
              <span className="flex-shrink-0">
                {mode.icon}
              </span>

              {/* 標籤 */}
              <span className="hidden sm:block">
                {mode.label}
              </span>

              {/* 當前模式指示器 */}
              {currentMode === mode.value && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-md shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 當前模式說明 */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {modes.find(mode => mode.value === currentMode)?.description}
          </span>

          {loading && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
              <span>切換中...</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PaginationModeToggle;
