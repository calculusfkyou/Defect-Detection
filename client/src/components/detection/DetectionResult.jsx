import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DefectList from './DefectList';
import ImageComparison from './ImageComparison';
import useAuth from '../../hooks/useAuth';
import useDetection from '../../hooks/useDetection';

const DetectionResult = ({ results, originalImage, onReset }) => {
  const { isAuthenticated } = useAuth();
  const { saveResults } = useDetection(); // 獲取保存功能
  const [activeTab, setActiveTab] = useState('defects'); // 'defects' or 'comparison'
  const [isSaving, setIsSaving] = useState(false); // 添加保存狀態
  const [saveMessage, setSaveMessage] = useState(null); // 保存結果訊息

  // 處理保存結果
  const handleSaveResults = async () => {
    if (!isAuthenticated()) return;

    setIsSaving(true);
    try {
      const success = await saveResults();

      if (success) {
        setSaveMessage({ type: 'success', text: '檢測結果已成功保存！' });
      } else {
        setSaveMessage({ type: 'error', text: '保存失敗，請稍後再試' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: '保存時發生錯誤' });
    } finally {
      setIsSaving(false);
      // 5秒後清除訊息
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

  // 瑕疵統計
  const defectCounts = results.defects.reduce((acc, defect) => {
    acc[defect.type] = (acc[defect.type] || 0) + 1;
    return acc;
  }, {});

  // 渲染瑕疵統計
  const renderDefectSummary = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
        {Object.entries(defectCounts).map(([type, count]) => (
          <div key={type} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDefectTypeColor(type)}`}>
              {type === 'missing_hole' && '缺失孔'}
              {type === 'mouse_bite' && '鼠咬'}
              {type === 'open_circuit' && '開路'}
              {type === 'short' && '短路'}
              {type === 'spur' && '毛刺'}
              {type === 'spurious_copper' && '多餘銅'}
            </div>
            <p className="mt-2 text-2xl font-bold">{count}</p>
            <p className="text-gray-500 text-sm">個瑕疵</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">檢測結果</h2>

        <div className="flex space-x-3">
          <button
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            重新檢測
          </button>

          {isAuthenticated() && (
            <button
              onClick={handleSaveResults}
              disabled={isSaving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isSaving ? '保存中...' : '保存結果'}
            </button>
          )}
        </div>
      </div>

      {/* 檢測摘要 */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-800">檢測完成</h3>
            <p className="text-blue-700">
              共檢測到 <span className="font-bold">{results.defects.length}</span> 個瑕疵，
              涉及 <span className="font-bold">{Object.keys(defectCounts).length}</span> 種類型
            </p>
          </div>
        </div>
      </div>

      {/* 瑕疵統計 */}
      {renderDefectSummary()}

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
            瑕疵列表
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
        <DefectList defects={results.defects} />
      ) : (
        <ImageComparison
          originalImage={originalImage}
          resultImage={results.resultImage}
        />
      )}
    </motion.div>
  );
};

export default DetectionResult;
