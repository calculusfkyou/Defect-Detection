import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import useRecentDetections from '../../hooks/useRecentDetections';

export default function RecentDetectionsList() {
  const navigate = useNavigate();
  const {
    recentDetections,
    total,
    hasMore,
    isUserSpecific,
    message,
    loading,
    error,
    isEmpty,
    hasData,
    isUserLoggedIn,
    refreshData
  } = useRecentDetections(5); // 顯示最近5條記錄

  // 🔧 瑕疵類型的中文對照和顏色
  const defectTypeMap = {
    'missing_hole': { name: '缺孔', color: 'bg-blue-100 text-blue-800' },
    'mouse_bite': { name: '鼠咬', color: 'bg-green-100 text-green-800' },
    'open_circuit': { name: '開路', color: 'bg-red-100 text-red-800' },
    'short': { name: '短路', color: 'bg-yellow-100 text-yellow-800' },
    'spur': { name: '毛刺', color: 'bg-purple-100 text-purple-800' },
    'spurious_copper': { name: '多餘銅', color: 'bg-pink-100 text-pink-800' }
  };

  // 🔧 處理項目點擊
  const handleItemClick = (detectionId) => {
    if (isUserLoggedIn) {
      navigate(`/history/${detectionId}`);
    } else {
      // 訪客用戶點擊時提示登入
      if (window.confirm('查看檢測詳情需要登入，是否前往登入頁面？')) {
        navigate('/login');
      }
    }
  };

  // 🔧 動畫配置
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mt-10">
      {/* 🔧 標題區域 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isUserSpecific ? '您的最近檢測' : '最近的檢測記錄'}
          </h2>
          {message && (
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* 刷新按鈕 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>

          {/* 查看全部按鈕 */}
          {hasData && (
            <Link
              to={isUserLoggedIn ? "/history" : "/detection"}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              {isUserLoggedIn ? '查看全部' : '開始檢測'}
            </Link>
          )}
        </div>
      </div>

      {/* 🔧 主要內容區域 */}
      <AnimatePresence mode="wait">
        {/* 載入狀態 */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* 錯誤狀態 */}
        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
              <button
                onClick={refreshData}
                className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
              >
                重試
              </button>
            </div>
          </motion.div>
        )}

        {/* 空狀態 */}
        {isEmpty && !error && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isUserSpecific ? '尚無檢測記錄' : '系統尚無檢測記錄'}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              {isUserSpecific
                ? '您還沒有進行過任何PCB瑕疵檢測。立即開始您的第一次檢測！'
                : '系統中還沒有任何檢測記錄。成為第一個使用者！'
              }
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/detection')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              開始檢測
            </motion.button>
          </motion.div>
        )}

        {/* 檢測記錄列表 */}
        {hasData && !loading && (
          <motion.div
            key="data"
            className="bg-white rounded-lg shadow-sm border overflow-hidden"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <ul className="divide-y divide-gray-200">
              {recentDetections.map((detection, index) => (
                <motion.li
                  key={detection.id}
                  variants={item}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleItemClick(detection.id)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      {/* 左側：檢測信息 */}
                      <div className="flex items-center space-x-4">
                        {/* 狀態圖標 */}
                        <div className={`
                          flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                          ${detection.hasDefects ? 'bg-red-100' : 'bg-green-100'}
                        `}>
                          {detection.hasDefects ? (
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* 檢測詳情 */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {detection.displayId}
                          </p>

                          <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {detection.timeAgo}
                            </span>

                            <span>•</span>

                            <span className="flex items-center">
                              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {detection.detectionTime}ms
                            </span>

                            <span>•</span>

                            <span className="flex items-center">
                              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {detection.averageConfidence}%
                            </span>
                          </div>

                          {/* 瑕疵類型標籤 */}
                          {detection.defectTypes.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {detection.defectTypes.slice(0, 3).map((type, typeIndex) => (
                                <span
                                  key={typeIndex}
                                  className={`
                                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                    ${defectTypeMap[type]?.color || 'bg-gray-100 text-gray-800'}
                                  `}
                                >
                                  {defectTypeMap[type]?.name || type}
                                </span>
                              ))}
                              {detection.defectTypes.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  +{detection.defectTypes.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 右側：檢測結果 */}
                      <div className="flex flex-col items-end space-y-2">
                        {detection.hasDefects ? (
                          <Badge variant="error">
                            發現 {detection.defectCount} 個瑕疵
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            品質良好
                          </Badge>
                        )}

                        {/* 置信度指示器 */}
                        <div className={`
                          text-xs px-2 py-1 rounded-full
                          ${detection.confidenceLevel === 'high' ? 'bg-green-100 text-green-700' :
                            detection.confidenceLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'}
                        `}>
                          {detection.confidenceLevel === 'high' ? '高信心' :
                           detection.confidenceLevel === 'medium' ? '中信心' : '低信心'}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* 底部信息 */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  顯示最近 {recentDetections.length} 條記錄
                  {total > recentDetections.length && ` (共 ${total} 條)`}
                </span>

                <div className="flex items-center space-x-4">
                  {hasMore && (
                    <span className="text-blue-600">還有更多記錄</span>
                  )}

                  {!isUserLoggedIn && (
                    <button
                      onClick={() => navigate('/login')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      登入查看更多
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
