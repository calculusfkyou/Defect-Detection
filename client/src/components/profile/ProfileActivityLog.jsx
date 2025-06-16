import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';

const ProfileActivityLog = ({
  activities,
  activityLoading,
  pagination,
  onLoadMore,
  canLoadMore
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  // 切換展開狀態
  const toggleExpanded = (id) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 獲取活動圖標
  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'detection':
        return activity.status === 'warning' ? (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // 獲取瑕疵類型中文名稱
  const getDefectTypeName = (type) => {
    const typeMap = {
      'missing_hole': '缺孔',
      'mouse_bite': '鼠咬',
      'open_circuit': '開路',
      'short': '短路',
      'spur': '毛刺',
      'spurious_copper': '多餘銅'
    };
    return typeMap[type] || type;
  };

  // 格式化時間
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffHours < 24) return `${diffHours} 小時前`;
    if (diffDays < 7) return `${diffDays} 天前`;

    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暫無活動記錄</h3>
        <p className="text-sm text-gray-500">
          您的活動記錄將會在這裡顯示，包括檢測歷史、設定變更等。
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          活動日誌
        </h3>
        <div className="text-sm text-gray-500">
          共 {pagination.total} 條記錄
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                {/* 活動圖標 */}
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity)}
                </div>

                {/* 活動內容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.action}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>

                  {/* 詳細信息切換 */}
                  {activity.details && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleExpanded(activity.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        {expandedItems.has(activity.id) ? '收起詳情' : '查看詳情'}
                        <svg
                          className={`ml-1 w-3 h-3 transition-transform ${
                            expandedItems.has(activity.id) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <motion.div
                        initial={false}
                        animate={{
                          height: expandedItems.has(activity.id) ? 'auto' : 0,
                          opacity: expandedItems.has(activity.id) ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs space-y-2">
                          {activity.type === 'detection' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">瑕疵數量:</span>
                                <span className="font-medium">{activity.details.defectCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">置信度:</span>
                                <span className="font-medium">{activity.details.confidence}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">檢測耗時:</span>
                                <span className="font-medium">{activity.details.detectionTime}ms</span>
                              </div>
                              {activity.details.defectTypes && activity.details.defectTypes.length > 0 && (
                                <div>
                                  <span className="text-gray-600">瑕疵類型:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {activity.details.defectTypes.map((type, i) => (
                                      <span
                                        key={i}
                                        className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                                      >
                                        {getDefectTypeName(type)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 載入更多按鈕 */}
        {canLoadMore && (
          <div className="text-center pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLoadMore}
              disabled={activityLoading}
              className="px-6 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {activityLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  載入中...
                </div>
              ) : (
                '載入更多'
              )}
            </motion.button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileActivityLog;
