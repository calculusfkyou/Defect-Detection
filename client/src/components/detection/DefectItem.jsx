import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DefectItem = ({ defect }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  console.log('🔍 DefectItem 收到的 defect:', {
    id: defect.id,
    type: defect.type,
    confidence: defect.confidence,
    hasThumbnail: !!defect.thumbnail,
    thumbnailPrefix: defect.thumbnail?.substring(0, 50)
  });

  // 🔧 處理不同的數據格式，同時支持新舊格式
  const defectType = defect.type || defect.defectType || 'unknown';
  const confidence = defect.confidence || 0;

  // 🔧 修改：直接使用原始數值，不轉換為百分比
  let position;
  if (defect.box) {
    position = {
      x: defect.box.x || 0,
      y: defect.box.y || 0,
      width: defect.box.width || 0,
      height: defect.box.height || 0
    };
  } else {
    position = {
      x: defect.xCenter || 0,
      y: defect.yCenter || 0,
      width: defect.width || 0,
      height: defect.height || 0
    };
  }

  // 瑕疵類型的中文映射
  const defectTypeMap = {
    'missing_hole': '缺孔',
    'mouse_bite': '鼠咬',
    'open_circuit': '開路',
    'short': '短路',
    'spur': '毛刺',
    'spurious_copper': '多餘銅'
  };

  const chineseType = defectTypeMap[defectType] || defectType;

  // 瑕疵嚴重程度顏色
  const getSeverityColor = (confidence) => {
    if (confidence >= 0.8) return 'red';
    if (confidence >= 0.6) return 'orange';
    return 'yellow';
  };

  // 瑕疵類型圖標顏色
  const getDefectTypeColor = (defectType) => {
    const colorMap = {
      'missing_hole': 'bg-blue-500',
      'mouse_bite': 'bg-green-500',
      'open_circuit': 'bg-red-500',
      'short': 'bg-yellow-500',
      'spur': 'bg-purple-500',
      'spurious_copper': 'bg-pink-500'
    };
    return colorMap[defectType] || 'bg-gray-500';
  };

  // 🔧 改進的縮圖驗證和錯誤處理
  const isValidThumbnail = (thumbnail) => {
    if (!thumbnail || typeof thumbnail !== 'string') {
      return false;
    }

    // 檢查是否是有效的 data URL
    const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
    if (!dataUrlPattern.test(thumbnail)) {
      console.error('❌ 無效的縮圖格式:', thumbnail.substring(0, 100));
      return false;
    }

    // 檢查是否有重複的前綴
    if (thumbnail.includes('data:image') && thumbnail.indexOf('data:image') !== thumbnail.lastIndexOf('data:image')) {
      console.error('❌ 檢測到重複的 data: 前綴:', thumbnail.substring(0, 100));
      return false;
    }

    return true;
  };

  // 處理圖片加載錯誤
  const handleImageError = (event) => {
    console.error('❌ 縮圖加載失敗:', {
      defectType,
      thumbnailUrl: defect.thumbnail?.substring(0, 100),
      error: event
    });
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ 縮圖加載成功:', defectType);
  };

  // 生成預設圖標
  const renderDefaultIcon = () => {
    const iconColorClass = getDefectTypeColor(defectType);

    return (
      <div className={`w-full h-full ${iconColorClass} rounded-md flex items-center justify-center`}>
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    );
  };

  // 決定是否顯示縮圖
  const shouldShowThumbnail = defect.thumbnail && isValidThumbnail(defect.thumbnail) && !imageError;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          {/* 🔧 改善的縮圖顯示邏輯 */}
          <div className="flex-shrink-0 w-12 h-12 mr-4 bg-gray-200 rounded-md overflow-hidden">
            {shouldShowThumbnail ? (
              <img
                src={defect.thumbnail}
                alt={`${chineseType} 縮圖`}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              renderDefaultIcon()
            )}
          </div>

          <div>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(confidence) === 'red' ? 'bg-red-100 text-red-800' : getSeverityColor(confidence) === 'orange' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {chineseType}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                ID: {defect.id || '未分配'}
              </span>
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-700">
                可信度:
              </span>
              <span className={`ml-1 font-medium ${confidence >= 0.8 ? 'text-green-600' : confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                {(confidence * 100).toFixed(1)}%
              </span>
              <div className="ml-2 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${confidence >= 0.8 ? 'bg-green-500' : confidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 pb-4 border-t border-gray-100"
        >
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">瑕疵詳情</h4>
              <ul className="space-y-2 text-sm">
                {/* 🔧 修改：直接顯示原始數值，保留4位小數 */}
                <li className="flex justify-between">
                  <span className="text-gray-500">位置 X:</span>
                  <span className="font-mono">{position.x.toFixed(4)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">位置 Y:</span>
                  <span className="font-mono">{position.y.toFixed(4)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">寬度:</span>
                  <span className="font-mono">{position.width.toFixed(4)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">高度:</span>
                  <span className="font-mono">{position.height.toFixed(4)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">置信度:</span>
                  <span className="font-mono">{confidence.toFixed(4)}</span>
                </li>
              </ul>
            </div>

            {/* 🔧 改善的放大檢視 */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">放大檢視</h4>
              <div className="bg-gray-200 rounded-md overflow-hidden" style={{ minHeight: '120px' }}>
                {shouldShowThumbnail ? (
                  <img
                    src={defect.thumbnail}
                    alt={`${chineseType} 瑕疵`}
                    className="w-full object-contain"
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center min-h-[120px]">
                    {renderDefaultIcon()}
                  </div>
                )}
              </div>
              {imageError && (
                <p className="text-xs text-gray-500 mt-1">縮圖加載失敗</p>
              )}
              {!defect.thumbnail && (
                <p className="text-xs text-gray-500 mt-1">無可用縮圖</p>
              )}
            </div>
          </div>

          {defect.description && (
            <div className="mt-3">
              <h4 className="font-medium text-gray-700 mb-1">問題描述</h4>
              <p className="text-sm text-gray-600">{defect.description}</p>
            </div>
          )}

          {defect.recommendation && (
            <div className="mt-3">
              <h4 className="font-medium text-gray-700 mb-1">建議處理</h4>
              <p className="text-sm text-gray-600">{defect.recommendation}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.li>
  );
};

export default DefectItem;
