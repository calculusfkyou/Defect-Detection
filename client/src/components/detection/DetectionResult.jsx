import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DefectList from './DefectList';
import ImageComparison from './ImageComparison';
import useAuth from '../../hooks/useAuth';
import { exportDetectionResults } from '../../services/detectionService';

const DetectionResult = ({ results, originalImage, onReset }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('defects');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [exportProgress, setExportProgress] = useState(''); // 🔧 新增：匯出進度狀態

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

  // 🔧 改進的匯出處理函數
  const handleExportResults = async () => {
    // 如果用戶未登入，顯示訪客提示
    if (!isAuthenticated()) {
      setShowGuestPrompt(true);
      return;
    }

    setIsExporting(true);
    setExportMessage(null);
    setExportProgress('正在準備匯出文件...'); // 🔧 設置初始進度

    try {
      console.log('📁 準備匯出的結果數據:', results);

      // 🔧 更新進度狀態
      setExportProgress('正在生成 ZIP 文件...');

      const exportResult = await exportDetectionResults(results);

      if (exportResult.success) {
        // 🔧 只有在確認下載後才顯示成功訊息
        setExportMessage({
          type: 'success',
          text: exportResult.message || '檢測結果已成功匯出！ZIP 檔案已下載到您的下載資料夾。',
          fileName: exportResult.fileName
        });
        setExportProgress(''); // 清除進度狀態
      } else {
        setExportMessage({
          type: 'error',
          text: exportResult.message || '匯出失敗，請稍後再試'
        });
        setExportProgress(''); // 清除進度狀態
      }
    } catch (error) {
      console.error('匯出結果時發生錯誤:', error);
      setExportMessage({
        type: 'error',
        text: '匯出時發生錯誤，請檢查網路連接並重試'
      });
      setExportProgress(''); // 清除進度狀態
    } finally {
      setIsExporting(false);
      // 🔧 延長成功訊息顯示時間
      setTimeout(() => {
        setExportMessage(null);
        setExportProgress('');
      }, 10000); // 延長到10秒
    }
  };

  // 關閉訪客提示
  const handleCloseGuestPrompt = () => {
    setShowGuestPrompt(false);
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

          {/* 🔧 改進的匯出按鈕 */}
          <button
            onClick={handleExportResults}
            disabled={isExporting}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                匯出中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                匯出結果
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔧 匯出進度顯示 */}
      {exportProgress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-md bg-blue-50 text-blue-800 border border-blue-200"
        >
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">{exportProgress}</span>
          </div>
        </motion.div>
      )}

      {/* 🔧 匯出結果訊息 */}
      {exportMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-4 p-4 rounded-md ${exportMessage.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {exportMessage.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{exportMessage.text}</p>
              {exportMessage.type === 'success' && (
                <div className="mt-2">
                  {/* 🔧 顯示文件名稱 */}
                  {exportMessage.fileName && (
                    <p className="text-sm text-green-600 font-medium">
                      📄 檔案名稱：{exportMessage.fileName}
                    </p>
                  )}
                  <p className="text-sm text-green-600 mt-1">
                    📁 ZIP 檔案包含：
                  </p>
                  <ul className="mt-1 text-sm text-green-600 list-disc list-inside ml-4">
                    <li>results/predict/output.jpg - 檢測結果圖片</li>
                    <li>results/predict/labels/input.txt - YOLO 格式標籤文件</li>
                  </ul>
                  <p className="mt-2 text-xs text-green-500">
                    💡 標籤格式與 YOLO 輸出完全相容，可直接用於模型訓練或驗證。
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 訪客模式匯出提示框 */}
      {showGuestPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseGuestPrompt}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  需要登入才能匯出
                </h3>
              </div>
              <button
                onClick={handleCloseGuestPrompt}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                很抱歉，匯出檢測結果功能需要會員登入才能使用。登入後您可以：
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  匯出包含結果圖片和標籤的 ZIP 文件
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  獲得 YOLO 格式的標籤文件
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  自動保存檢測歷史記錄
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  批量匯出多次檢測結果
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <a
                href="/login"
                className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                立即登入
              </a>
              <a
                href="/register"
                className="flex-1 bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                註冊帳號
              </a>
            </div>

            <button
              onClick={handleCloseGuestPrompt}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              稍後再說
            </button>
          </div>
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
