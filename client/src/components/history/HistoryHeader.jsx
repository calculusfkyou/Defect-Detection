import React from 'react';
import { motion } from 'framer-motion';

const HistoryHeader = ({
  totalCount = 0,
  selectedCount = 0,
  loading = false,
  stats = {
    monthlyDetections: 0,
    monthlyDefects: 0,
    averageConfidence: 0,
    qualityRate: 0,
    loading: false,
    error: null
  }
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            檢測歷史記錄
          </h1>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>載入中...</span>
              </div>
            ) : (
              <>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  總共 {totalCount.toLocaleString()} 條記錄
                </span>

                {selectedCount > 0 && (
                  <span className="flex items-center text-blue-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已選擇 {selectedCount} 項
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* 動態統計信息卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 本月檢測次數 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-sm border p-4 min-w-0"
          >
            <div className="text-sm font-medium text-gray-500">本月檢測</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.loading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
              ) : (
                stats.monthlyDetections.toLocaleString()
              )}
            </div>
            {!stats.loading && stats.monthlyDetections > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                次檢測
              </div>
            )}
          </motion.div>

          {/* 本月檢出瑕疵 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-sm border p-4 min-w-0"
          >
            <div className="text-sm font-medium text-gray-500">檢出瑕疵</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.loading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
              ) : (
                stats.monthlyDefects.toLocaleString()
              )}
            </div>
            {!stats.loading && stats.monthlyDefects > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                個瑕疵
              </div>
            )}
          </motion.div>

          {/* 平均置信度 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-sm border p-4 min-w-0"
          >
            <div className="text-sm font-medium text-gray-500">平均置信度</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.loading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
              ) : (
                `${stats.averageConfidence.toFixed(1)}%`
              )}
            </div>
            {!stats.loading && stats.averageConfidence > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                檢測精度
              </div>
            )}
          </motion.div>

          {/* 品質率 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-sm border p-4 min-w-0"
          >
            <div className="text-sm font-medium text-gray-500">品質率</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.loading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
              ) : (
                `${stats.qualityRate}%`
              )}
            </div>
            {!stats.loading && (
              <div className="text-xs text-gray-400 mt-1">
                無瑕疵率
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 錯誤提示 */}
      {stats.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              統計數據載入失敗：{stats.error}
            </span>
          </div>
        </motion.div>
      )}

      {/* 進度條（當有選擇項目時顯示） */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">
                已選擇 {selectedCount} 個檢測記錄
              </span>
              <span className="text-blue-600">
                {totalCount > 0 && `${((selectedCount / totalCount) * 100).toFixed(1)}% 的記錄`}
              </span>
            </div>

            {totalCount > 0 && (
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(selectedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistoryHeader;
