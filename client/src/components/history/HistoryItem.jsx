import React from 'react';
import { motion } from 'framer-motion';

const HistoryItem = ({
  item,
  isSelected = false,
  onItemClick,
  onItemSelect
}) => {
  // 瑕疵類型的中文對照
  const defectTypeMap = {
    'missing_hole': '缺孔',
    'mouse_bite': '鼠咬',
    'open_circuit': '開路',
    'short': '短路',
    'spur': '毛刺',
    'spurious_copper': '多餘銅'
  };

  // 瑕疵類型顏色對照
  const defectTypeColors = {
    'missing_hole': 'bg-blue-100 text-blue-800',
    'mouse_bite': 'bg-green-100 text-green-800',
    'open_circuit': 'bg-red-100 text-red-800',
    'short': 'bg-yellow-100 text-yellow-800',
    'spur': 'bg-purple-100 text-purple-800',
    'spurious_copper': 'bg-pink-100 text-pink-800'
  };

  // 🔧 修改：格式化檢測標題為日期時間
  const formatDetectionTitle = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 格式化相對時間（用於副標題）
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? '剛剛' : `${diffInMinutes} 分鐘前`;
    } else if (diffInHours < 24) {
      return `${diffInHours} 小時前`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} 天前`;
      } else if (diffInDays < 30) {
        return `${Math.floor(diffInDays / 7)} 週前`;
      } else {
        return `${Math.floor(diffInDays / 30)} 個月前`;
      }
    }
  };

  // 格式化檢測時間
  const formatDetectionTime = (timeMs) => {
    if (timeMs < 1000) {
      return `${timeMs}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  // 處理卡片點擊事件
  const handleCardClick = (e) => {
    // 如果點擊的是選擇框或按鈕，不觸發卡片點擊
    if (e.target.type === 'checkbox' || e.target.closest('button')) {
      return;
    }
    onItemClick();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`
        relative bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
      onClick={handleCardClick}
    >
      {/* 選擇框 */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onItemSelect}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* 卡片內容 */}
      <div className="p-6 pl-12">
        {/* 🔧 修改：標題區域 - 使用日期時間作為主標題 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {formatDetectionTitle(item.createdAt)}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                </svg>
                ID: #{item.id}
              </span>
              <span>•</span>
              <span>{formatRelativeTime(item.createdAt)}</span>
            </div>
          </div>

          {/* 狀態指示器 */}
          <div className={`
            flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${item.defectCount > 0
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full mr-2
              ${item.defectCount > 0 ? 'bg-red-500' : 'bg-green-500'}
            `} />
            {item.defectCount > 0 ? '有瑕疵' : '正常'}
          </div>
        </div>

        {/* 統計信息 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">
              {item.defectCount}
            </div>
            <div className="text-sm text-gray-500">瑕疵數量</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">
              {(item.averageConfidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">平均置信度</div>
          </div>
        </div>

        {/* 瑕疵類型標籤 */}
        {item.defectTypes && item.defectTypes.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">瑕疵類型:</div>
            <div className="flex flex-wrap gap-2">
              {item.defectTypes.map((type, index) => (
                <span
                  key={`${type}-${index}`}
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${defectTypeColors[type] || 'bg-gray-100 text-gray-800'}
                  `}
                >
                  {defectTypeMap[type] || type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDetectionTime(item.detectionTime)}
            </span>

            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              檢測完成
            </span>
          </div>

          {/* 快速操作按鈕 */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onItemClick();
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none"
            >
              查看詳情
            </motion.button>
          </div>
        </div>
      </div>

      {/* 懸停效果指示器 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none opacity-0"
        style={{
          background: 'linear-gradient(45deg, transparent 48%, rgba(59, 130, 246, 0.1) 50%, transparent 52%)'
        }}
      />
    </motion.div>
  );
};

export default HistoryItem;
