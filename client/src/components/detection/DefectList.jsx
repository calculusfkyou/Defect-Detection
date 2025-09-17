import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DefectItem from './DefectItem';

const DefectList = ({ defects = [] }) => {
  const [sortBy, setSortBy] = useState('confidence');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedType, setSelectedType] = useState('all');

  // 🛡️ 確保 defects 是數組並且數據完整
  const safeDefects = Array.isArray(defects) ? defects.filter(defect =>
    defect && (defect.type || defect.defectType) && defect.confidence !== undefined
  ) : [];

  console.log('🔍 DefectList 接收到的數據:', {
    originalDefects: defects,
    safeDefects: safeDefects,
    safeDefectsLength: safeDefects.length
  });

  // 獲取所有瑕疵類型
  const defectTypes = React.useMemo(() => {
    const types = ['all'];
    safeDefects.forEach(defect => {
      const defectType = defect.type || defect.defectType;
      if (defectType && !types.includes(defectType)) {
        types.push(defectType);
      }
    });
    return types;
  }, [safeDefects]);

  // 排序和過濾瑕疵
  const filteredAndSortedDefects = React.useMemo(() => {
    let filtered = [...safeDefects];

    // 過濾特定類型
    if (selectedType !== 'all') {
      filtered = filtered.filter(defect => {
        const defectType = defect.type || defect.defectType;
        return defectType === selectedType;
      });
    }

    // 排序
    return filtered.sort((a, b) => {
      if (sortBy === 'confidence') {
        const aValue = a.confidence || 0;
        const bValue = b.confidence || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = a.type || a.defectType || '';
        const bValue = b.type || b.defectType || '';
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
  }, [safeDefects, sortBy, sortOrder, selectedType]);

  // 處理排序改變
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // 獲取瑕疵類型的中文名稱
  const getDefectTypeName = (type) => {
    const typeNames = {
      'missing_hole': '缺失孔',
      'mouse_bite': '鼠咬',
      'open_circuit': '開路',
      'short': '短路',
      'spur': '毛刺',
      'spurious_copper': '多餘銅',
      'all': '全部'
    };
    return typeNames[type] || type;
  };

  // 如果沒有瑕疵數據
  if (safeDefects.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">沒有檢測到瑕疵</h3>
        <p className="mt-1 text-gray-500">您的PCB板看起來很好！</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* 類型選擇器 */}
        <div className="relative">
          <select
            className="appearance-none block w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {defectTypes.map(type => (
              <option key={type} value={type}>
                {getDefectTypeName(type)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        {/* 排序控制 */}
        <div className="flex gap-2 text-sm text-gray-600">
          <span>排序:</span>
          <button
            onClick={() => handleSortChange('type')}
            className={`hover:text-blue-600 ${
              sortBy === 'type' ? 'font-bold text-blue-600' : ''
            }`}
          >
            類型
            {sortBy === 'type' && (
              <span className="ml-1">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
          <span>|</span>
          <button
            onClick={() => handleSortChange('confidence')}
            className={`hover:text-blue-600 ${
              sortBy === 'confidence' ? 'font-bold text-blue-600' : ''
            }`}
          >
            可信度
            {sortBy === 'confidence' && (
              <span className="ml-1">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </button>
        </div>
      </div>

      {filteredAndSortedDefects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ul className="space-y-3">
            {filteredAndSortedDefects.map((defect, index) => (
              <DefectItem key={defect.id || index} defect={defect} />
            ))}
          </ul>
        </motion.div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">沒有找到符合條件的瑕疵</p>
        </div>
      )}
    </div>
  );
};

export default DefectList;
