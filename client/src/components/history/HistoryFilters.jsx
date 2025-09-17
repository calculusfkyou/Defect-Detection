import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableDefectTypes, getSearchSuggestions } from '../../services/detectionService';

const HistoryFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onSort,
  onClearFilters,
  hasActiveFilters = false,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // 🔧 搜尋建議相關狀態
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // 🔧 動態瑕疵類型
  const [availableDefectTypes, setAvailableDefectTypes] = useState([
    { value: '', label: '所有類型', count: 0 }
  ]);

  // 日期範圍選項
  const dateRanges = [
    { value: '', label: '所有時間' },
    { value: 'today', label: '今天' },
    { value: 'week', label: '最近一週' },
    { value: 'month', label: '最近一個月' },
    { value: 'quarter', label: '最近三個月' },
    { value: 'year', label: '最近一年' }
  ];

  // 🔧 排序選項
  const sortOptions = [
    {
      value: 'createdAt',
      label: '檢測時間',
      ascLabel: '時間 (舊到新)',
      descLabel: '時間 (新到舊)'
    },
    {
      value: 'defectCount',
      label: '瑕疵數量',
      ascLabel: '數量 (少到多)',
      descLabel: '數量 (多到少)'
    },
    {
      value: 'averageConfidence',
      label: '平均置信度',
      ascLabel: '置信度 (低到高)',
      descLabel: '置信度 (高到低)'
    },
    {
      value: 'detectionTime',
      label: '檢測耗時',
      ascLabel: '耗時 (少到多)',
      descLabel: '耗時 (多到少)'
    }
  ];

  // 🔧 載入可用瑕疵類型
  useEffect(() => {
    const loadDefectTypes = async () => {
      try {
        const result = await getAvailableDefectTypes();
        if (result.success && result.data.defectTypes) {
          setAvailableDefectTypes([
            { value: '', label: '所有類型', count: 0 },
            ...result.data.defectTypes
          ]);
        }
      } catch (error) {
        console.error('載入瑕疵類型失敗:', error);
        // 使用預設列表
        setAvailableDefectTypes([
          { value: '', label: '所有類型' },
          { value: 'missing_hole', label: '缺孔' },
          { value: 'mouse_bite', label: '鼠咬' },
          { value: 'open_circuit', label: '開路' },
          { value: 'short', label: '短路' },
          { value: 'spur', label: '毛刺' },
          { value: 'spurious_copper', label: '多餘銅' }
        ]);
      }
    };

    loadDefectTypes();
  }, []);

  // 🔧 搜尋建議防抖
  const debouncedGetSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setSuggestionLoading(true);
        const result = await getSearchSuggestions(query);
        if (result.success && result.data.suggestions) {
          setSearchSuggestions(result.data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('獲取搜尋建議失敗:', error);
        setSearchSuggestions([]);
      } finally {
        setSuggestionLoading(false);
      }
    }, 300),
    []
  );

  // 處理搜索輸入
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedGetSuggestions(value);
  }, [debouncedGetSuggestions]);

  // 🔧 處理搜尋建議選擇
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchInput(suggestion.value);
    setShowSuggestions(false);
    onSearch(suggestion.value);
  }, [onSearch]);

  // 處理搜索提交
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(searchInput);
  }, [searchInput, onSearch]);

  // 🔧 修復：處理篩選變更 - 立即觸發篩選
  const handleFilterChange = useCallback((filterName, value) => {
    console.log('🔍 HistoryFilters - 篩選變更:', { [filterName]: value });

    // 🔑 立即調用父組件的篩選處理函數
    onFilterChange({ [filterName]: value });
  }, [onFilterChange]);

  // 🔧 處理排序變更
  const handleSortChange = useCallback((e) => {
    const [sortBy, sortOrder] = e.target.value.split('_');
    console.log('📊 HistoryFilters - 排序變更:', { sortBy, sortOrder });
    onSort(sortBy, sortOrder);
  }, [onSort]);

  // 🔧 同步搜尋輸入框狀態
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // 🔧 點擊外部關閉建議
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && !searchRef.current.contains(event.target) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border p-6 mb-6"
    >
      {/* 🔧 搜索欄 */}
      <div className="relative mb-4" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchSuggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="搜索檢測記錄... (輸入ID、日期等)"
              disabled={loading}
              className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              {suggestionLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="h-full px-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </form>

        {/* 🔧 搜尋建議下拉列表 */}
        <AnimatePresence>
          {showSuggestions && searchSuggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {searchSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${suggestion.type === 'id' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                    `}>
                      {suggestion.type === 'id' ? '#' : '📅'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {suggestion.label}
                      </div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 展開/收合按鈕與排序 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <span>進階篩選</span>
            <motion.svg
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onClearFilters}
              disabled={loading}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              清除篩選
            </motion.button>
          )}
        </div>

        {/* 快速排序 */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">排序:</label>
          <select
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={handleSortChange}
            disabled={loading}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            {sortOptions.map(option => (
              <React.Fragment key={option.value}>
                <option value={`${option.value}_desc`}>
                  {option.descLabel}
                </option>
                <option value={`${option.value}_asc`}>
                  {option.ascLabel}
                </option>
              </React.Fragment>
            ))}
          </select>
        </div>
      </div>

      {/* 🔧 展開的篩選選項 */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-4 border-t border-gray-200">
          {/* 🔧 基本篩選 - 3個主要篩選 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* 瑕疵類型篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  瑕疵類型
                </span>
              </label>
              <select
                value={filters.defectType || ''}
                onChange={(e) => {
                  console.log('🔍 瑕疵類型選擇變更:', e.target.value);
                  handleFilterChange('defectType', e.target.value);
                }}
                disabled={loading}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                {availableDefectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} {type.count ? `(${type.count})` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                篩選特定類型的瑕疵檢測記錄
              </p>
            </div>

            {/* 時間範圍篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  時間範圍
                </span>
              </label>
              <select
                value={filters.dateRange || ''}
                onChange={(e) => {
                  console.log('📅 時間範圍選擇變更:', e.target.value);
                  handleFilterChange('dateRange', e.target.value);
                }}
                disabled={loading}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                依檢測時間篩選記錄範圍
              </p>
            </div>

            {/* 檢測結果篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  檢測結果
                </span>
              </label>
              <select
                value={filters.hasDefects || ''}
                onChange={(e) => {
                  console.log('🔍 檢測結果選擇變更:', e.target.value);
                  handleFilterChange('hasDefects', e.target.value);
                }}
                disabled={loading}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">所有結果</option>
                <option value="true">🔴 有檢出瑕疵</option>
                <option value="false">🟢 品質良好</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                篩選是否檢測到瑕疵的記錄
              </p>
            </div>
          </div>

          {/* 篩選說明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900">
                  篩選功能說明
                </h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="space-y-1">
                    <li>• <strong>瑕疵類型</strong>：依據特定的瑕疵類型（如缺孔、短路等）進行篩選</li>
                    <li>• <strong>時間範圍</strong>：依據檢測的時間範圍（今天、本週、本月等）進行篩選</li>
                    <li>• <strong>檢測結果</strong>：區分有瑕疵和品質良好的檢測記錄</li>
                    <li>• <strong>文字搜尋</strong>：可搜尋記錄ID或日期關鍵字</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 活躍篩選標籤 */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200"
        >
          <span className="text-sm font-medium text-gray-500 mr-2">已套用篩選:</span>

          {filters.search && (
            <FilterTag
              label={`搜索: "${filters.search}"`}
              onRemove={() => handleFilterChange('search', '')}
              color="blue"
            />
          )}

          {filters.defectType && (
            <FilterTag
              label={`類型: ${availableDefectTypes.find(t => t.value === filters.defectType)?.label || filters.defectType}`}
              onRemove={() => handleFilterChange('defectType', '')}
              color="green"
            />
          )}

          {filters.dateRange && (
            <FilterTag
              label={`時間: ${dateRanges.find(r => r.value === filters.dateRange)?.label || filters.dateRange}`}
              onRemove={() => handleFilterChange('dateRange', '')}
              color="purple"
            />
          )}

          {filters.hasDefects && (
            <FilterTag
              label={`結果: ${filters.hasDefects === 'true' ? '有瑕疵' : '無瑕疵'}`}
              onRemove={() => handleFilterChange('hasDefects', '')}
              color="orange"
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// 🔧 篩選標籤組件
const FilterTag = ({ label, onRemove, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorClasses[color]}`}>
      {label}
      <button
        onClick={onRemove}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-opacity-20 hover:bg-black"
      >
        ×
      </button>
    </span>
  );
};

// 🔧 防抖函數
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default HistoryFilters;
