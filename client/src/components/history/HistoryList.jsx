import React from 'react';
import { motion } from 'framer-motion';
import HistoryItem from './HistoryItem';
import HistoryPagination from './HistoryPagination';

const HistoryList = ({
  history = [],
  loading = false,
  selectedItems = new Set(),
  onItemClick,
  onItemSelect,
  // 🔧 分頁相關props
  pagination = {},
  onPageChange,
  onPreviousPage,
  onNextPage
}) => {

  // 載入中的骨架屏
  const SkeletonItem = ({ index }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border p-6"
    >
      <div className="animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </motion.div>
  );

  if (loading && history.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <SkeletonItem key={index} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 檢測記錄網格 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <HistoryItem
              item={item}
              isSelected={selectedItems.has(item.id)}
              onItemClick={() => onItemClick(item.id)}
              onItemSelect={() => onItemSelect(item.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 🔧 分頁控制器 - 只有一頁以上時顯示 */}
      {pagination.pages > 1 && (
        <HistoryPagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
          onPreviousPage={onPreviousPage}
          onNextPage={onNextPage}
          loading={loading}
        />
      )}

      {/* 🔧 底部資訊 - 記錄總數 */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-center text-sm text-gray-500 py-4"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              第 {pagination.page} 頁，共 {pagination.pages} 頁，
              總計 {pagination.total} 條記錄
            </span>
          </div>
        </motion.div>
      )}

      {/* 🔧 空頁面提示 */}
      {history.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">此頁面沒有檢測記錄</p>
        </motion.div>
      )}
    </div>
  );
};

export default HistoryList;
