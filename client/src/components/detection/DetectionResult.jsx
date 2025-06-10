import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DefectList from './DefectList';
import ImageComparison from './ImageComparison';
import useAuth from '../../hooks/useAuth';
import useDetection from '../../hooks/useDetection';

const DetectionResult = ({ results, originalImage, onReset }) => {
  const { isAuthenticated } = useAuth();
  const { saveResults } = useDetection();
  const [activeTab, setActiveTab] = useState('defects');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    console.log('🔍 DetectionResult useEffect 觸發');
    console.log('  - results:', results);
    console.log('  - originalImage:', originalImage);
    console.log('  - originalImage 類型:', typeof originalImage);

    if (results) {
      console.log('  - results.defects:', results.defects);
      console.log('  - results.defects 是否為數組:', Array.isArray(results.defects));
      console.log('  - results.defects 長度:', results.defects?.length);
      console.log('  - results.originalImage:', results.originalImage ? '存在' : '不存在');
      console.log('  - results.resultImage:', results.resultImage ? '存在' : '不存在');

      if (Array.isArray(results.defects) && results.defects.length > 0) {
        console.log('  - 第一個瑕疵:', results.defects[0]);
      }
    }
  }, [results]);

  // 🔒 數據安全檢查
  if (!results) {
    return (
      <div className="mt-6 text-center py-8">
        <p className="text-gray-500">無檢測結果數據</p>
        <button
          onClick={onReset}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          重新開始
        </button>
      </div>
    );
  }

  // 🛡️ 確保 defects 是數組並且有效
  const safeDefects = Array.isArray(results.defects) ? results.defects : [];

  // 🛡️ 確保 summary 存在
  const safeSummary = results.summary || {
    totalDefects: safeDefects.length,
    averageConfidence: 0,
    detectionTime: 0
  };

  // 處理保存結果
  const handleSaveResults = async () => {
    if (!isAuthenticated()) return;

    setIsSaving(true);
    try {
      const success = await saveResults(results);

      if (success) {
        setSaveMessage({ type: 'success', text: '檢測結果已成功保存！' });
      } else {
        setSaveMessage({ type: 'error', text: '保存失敗，請稍後再試' });
      }
    } catch (error) {
      console.error('保存結果時發生錯誤:', error);
      setSaveMessage({ type: 'error', text: '保存時發生錯誤' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // 根據瑕疵類型獲取不同顏色
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

  // 🔢 安全的瑕疵統計計算
  const defectCounts = safeDefects.reduce((acc, defect) => {
    if (defect && defect.type) {
      acc[defect.type] = (acc[defect.type] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-6"
    >
      {/* 頂部操作欄 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">檢測結果</h2>

        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重新檢測
          </button>

          {isAuthenticated() && (
            <button
              onClick={handleSaveResults}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSaving ? '保存中...' : '保存結果'}
            </button>
          )}
        </div>
      </div>

      {/* 保存結果訊息 */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-4 p-4 rounded-md ${saveMessage.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {saveMessage.text}
        </motion.div>
      )}

      {/* 檢測摘要 */}
      <div className={`rounded-lg p-4 mb-6 border ${safeDefects.length > 0
        ? 'bg-red-50 border-red-100'
        : 'bg-green-50 border-green-100'
        }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className={`h-6 w-6 ${safeDefects.length > 0 ? 'text-red-600' : 'text-green-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {safeDefects.length > 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
            </svg>
          </div>
          <div className="ml-3">
            <h3 className={`text-lg font-medium ${safeDefects.length > 0 ? 'text-red-800' : 'text-green-800'}`}>
              檢測完成 {safeDefects.length > 0 ? '- 發現瑕疵' : '- 無瑕疵發現'}
            </h3>
            <p className={safeDefects.length > 0 ? 'text-red-700' : 'text-green-700'}>
              {safeDefects.length > 0 ? (
                <>
                  共檢測到 <span className="font-bold">{safeDefects.length}</span> 個瑕疵，
                  涉及 <span className="font-bold">{Object.keys(defectCounts).length}</span> 種類型
                  {safeSummary.averageConfidence > 0 && (
                    <>，平均置信度 <span className="font-bold">{(safeSummary.averageConfidence * 100).toFixed(1)}%</span></>
                  )}
                  {safeSummary.detectionTime > 0 && (
                    <>，檢測耗時 <span className="font-bold">{safeSummary.detectionTime}ms</span></>
                  )}
                </>
              ) : (
                '恭喜！您的PCB板沒有檢測到任何瑕疵。'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 瑕疵統計卡片 - 只在有瑕疵時顯示 */}
      {safeDefects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
          {Object.entries(defectCounts).map(([type, count]) => (
            <div key={type} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDefectTypeColor(type)}`}>
                {getDefectTypeName(type)}
              </div>
              <p className="mt-2 text-2xl font-bold">{count}</p>
              <p className="text-gray-500 text-sm">個瑕疵</p>
            </div>
          ))}
        </div>
      )}

      {/* 切換標籤 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('defects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'defects'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            瑕疵列表 ({safeDefects.length})
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'comparison'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            圖像對比
          </button>
        </nav>
      </div>

      {/* 內容區域 */}
      {activeTab === 'defects' ? (
        <DefectList defects={safeDefects} />
      ) : (
        <ImageComparison
          originalImage={results.originalImage}
          resultImage={results.resultImage}
        />
      )}
    </motion.div>
  );
};

export default DetectionResult;
