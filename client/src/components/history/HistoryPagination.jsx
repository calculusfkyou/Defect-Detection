import React from 'react';
import { motion } from 'framer-motion';

const HistoryPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
  loading = false
}) => {
  // 計算顯示的頁碼範圍
  const getPageNumbers = () => {
    const delta = 2; // 當前頁面前後顯示的頁數
    const range = [];
    const rangeWithDots = [];

    // 計算範圍
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // 添加第一頁和省略號
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('...');
      }
    }

    // 添加範圍內的頁碼
    rangeWithDots.push(...range);

    // 添加最後一頁和省略號
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // 計算當前頁顯示的項目範圍
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null; // 只有一頁或沒有數據時不顯示分頁
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 左側：項目範圍信息 */}
        <div className="flex items-center text-sm text-gray-700">
          <span>
            顯示第 <span className="font-medium">{startItem}</span> 到{' '}
            <span className="font-medium">{endItem}</span> 項，
            共 <span className="font-medium">{totalItems}</span> 項記錄
          </span>
        </div>

        {/* 右側：分頁控制 */}
        <div className="flex items-center space-x-2">
          {/* 上一頁按鈕 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPreviousPage}
            disabled={currentPage === 1 || loading}
            className={`
              inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border
              transition-colors duration-200
              ${currentPage === 1 || loading
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }
            `}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            上一頁
          </motion.button>

          {/* 頁碼按鈕 */}
          <div className="hidden sm:flex items-center space-x-1">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-2 text-sm text-gray-500">...</span>
                ) : (
                  <motion.button
                    whileHover={{ scale: pageNum !== currentPage ? 1.05 : 1 }}
                    whileTap={{ scale: pageNum !== currentPage ? 0.95 : 1 }}
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${pageNum === currentPage
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : loading
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      }
                    `}
                  >
                    {pageNum}
                  </motion.button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 手機版頁碼顯示 */}
          <div className="sm:hidden flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              第 <span className="font-medium">{currentPage}</span> 頁，
              共 <span className="font-medium">{totalPages}</span> 頁
            </span>
          </div>

          {/* 下一頁按鈕 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextPage}
            disabled={currentPage === totalPages || loading}
            className={`
              inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border
              transition-colors duration-200
              ${currentPage === totalPages || loading
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }
            `}
          >
            下一頁
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* 快速跳轉（桌面版） */}
      <div className="hidden lg:flex items-center justify-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <label htmlFor="page-jump" className="text-sm text-gray-700">
            跳轉到第
          </label>
          <input
            id="page-jump"
            type="number"
            min="1"
            max={totalPages}
            defaultValue={currentPage}
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages && page !== currentPage) {
                  onPageChange(page);
                }
              }
            }}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-700">頁</span>
        </div>
      </div>

      {/* 載入指示器 */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>載入中...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistoryPagination;
