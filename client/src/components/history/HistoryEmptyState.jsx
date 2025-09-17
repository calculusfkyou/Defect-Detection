import React from 'react';
import { motion } from 'framer-motion';

const HistoryEmptyState = ({
  hasActiveFilters = false,
  onClearFilters,
  onNavigateToDetection
}) => {

  // 不同情況下的空狀態內容
  const emptyStateContent = hasActiveFilters
    ? {
        icon: (
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
        title: '沒有符合條件的檢測記錄',
        description: '請嘗試調整篩選條件或清除所有篩選來查看更多記錄。',
        actions: [
          {
            label: '清除所有篩選',
            onClick: onClearFilters,
            primary: true
          }
        ]
      }
    : {
        icon: (
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        title: '尚無檢測記錄',
        description: '您還沒有進行過任何PCB瑕疵檢測。立即開始您的第一次檢測，系統會自動保存檢測結果供您日後查看。',
        actions: [
          {
            label: '開始檢測',
            onClick: onNavigateToDetection,
            primary: true
          }
        ]
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        {/* 圖標 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {emptyStateContent.icon}
        </motion.div>

        {/* 標題 */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6 text-lg font-medium text-gray-900"
        >
          {emptyStateContent.title}
        </motion.h3>

        {/* 描述 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-2 text-sm text-gray-500 leading-relaxed"
        >
          {emptyStateContent.description}
        </motion.p>

        {/* 操作按鈕 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          {emptyStateContent.actions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={`
                inline-flex items-center px-6 py-3 border text-sm font-medium rounded-md
                focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                ${action.primary
                  ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                }
              `}
            >
              {action.primary && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              {action.label}
            </motion.button>
          ))}
        </motion.div>

        {/* 額外提示信息 */}
        {!hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="mt-8 p-4 bg-blue-50 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900">
                  檢測記錄的優勢
                </h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="space-y-1">
                    <li>• 追蹤歷史檢測結果和趨勢</li>
                    <li>• 匯出詳細的檢測報告</li>
                    <li>• 比較不同時間的檢測數據</li>
                    <li>• 建立品質控制檔案</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 統計數據卡片（當有篩選但無結果時） */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-400">0</div>
              <div className="text-sm text-gray-500">符合條件的記錄</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-sm text-gray-500">總瑕疵數量</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-sm text-gray-500">平均置信度</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryEmptyState;
