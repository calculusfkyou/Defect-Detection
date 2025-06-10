import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DefectItem = ({ defect }) => {
  const [expanded, setExpanded] = useState(false);

  // 獲取瑕疵類型的中文名稱
  const getDefectTypeName = (type) => {
    const typeNames = {
      'missing_hole': '缺失孔',
      'mouse_bite': '鼠咬',
      'open_circuit': '開路',
      'short': '短路',
      'spur': '毛刺',
      'spurious_copper': '多餘銅'
    };
    return typeNames[type] || type;
  };

  // 根據瑕疵類型獲取顏色
  const getDefectTypeColor = (defectType) => {
    const colorMap = {
      'missing_hole': 'bg-blue-100 text-blue-800',
      'mouse_bite': 'bg-green-100 text-green-800',
      'open_circuit': 'bg-red-100 text-red-800',
      'short': 'bg-yellow-100 text-yellow-800',
      'spur': 'bg-purple-100 text-purple-800',
      'spurious_copper': 'bg-pink-100 text-pink-800'
    };

    return colorMap[defectType] || 'bg-gray-100 text-gray-800';
  };

  // 計算置信度百分比
  const confidencePercent = Math.round(defect.confidence * 100);

  // 根據置信度獲取不同的顏色
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

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
          <div className="flex-shrink-0 w-12 h-12 mr-4 bg-gray-200 rounded-md overflow-hidden">
            {defect.thumbnail && (
              <img
                src={defect.thumbnail}
                alt={`${getDefectTypeName(defect.type)} 縮圖`}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDefectTypeColor(defect.type)}`}>
                {getDefectTypeName(defect.type)}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                ID: {defect.id || '未分配'}
              </span>
            </div>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-700">
                可信度:
              </span>
              <span className={`ml-1 font-medium ${getConfidenceColor(defect.confidence)}`}>
                {confidencePercent}%
              </span>
              <div className="ml-2 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${confidencePercent >= 80 ? 'bg-green-500' : confidencePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${confidencePercent}%` }}
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
                <li className="flex justify-between">
                  <span className="text-gray-500">位置 X:</span>
                  <span>{defect.box ? defect.box.x.toFixed(2) : 'N/A'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">位置 Y:</span>
                  <span>{defect.box ? defect.box.y.toFixed(2) : 'N/A'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">寬度:</span>
                  <span>{defect.box ? defect.box.width.toFixed(2) : 'N/A'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">高度:</span>
                  <span>{defect.box ? defect.box.height.toFixed(2) : 'N/A'}</span>
                </li>
              </ul>
            </div>

            {defect.image && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">放大檢視</h4>
                <div className="bg-gray-200 rounded-md overflow-hidden">
                  <img
                    src={defect.image}
                    alt={`${getDefectTypeName(defect.type)} 瑕疵`}
                    className="w-full object-contain"
                  />
                </div>
              </div>
            )}
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
