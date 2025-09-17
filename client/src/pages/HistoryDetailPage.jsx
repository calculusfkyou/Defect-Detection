import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import DetectionResult from '../components/detection/DetectionResult';
import useHistory from '../hooks/useHistory';
import useAuth from '../hooks/useAuth';

const HistoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchDetectionDetail } = useHistory();

  const [detectionData, setDetectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔧 格式化檢測記錄標題
  const formatDetectionTitle = (dateString) => {
    if (!dateString) return `檢測記錄 #${id}`;

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

  // 🔧 格式化檢測記錄詳細時間
  const formatDetailedTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 檢查認證並獲取檢測詳情
  useEffect(() => {
    const loadDetectionDetail = async () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      if (!id) {
        setError('無效的檢測記錄ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('📄 載入檢測詳情頁面，ID:', id);
        const data = await fetchDetectionDetail(id);

        console.log('✅ 檢測詳情載入成功:', data);
        setDetectionData(data);

      } catch (err) {
        console.error('❌ 載入檢測詳情失敗:', err);
        setError(err.message || '載入檢測詳情失敗');
      } finally {
        setLoading(false);
      }
    };

    loadDetectionDetail();
  }, [id, isAuthenticated, navigate, fetchDetectionDetail]);

  // 處理返回操作
  const handleBack = () => {
    navigate('/history');
  };

  // 處理重新檢測（導向檢測頁面）
  const handleReDetect = () => {
    navigate('/detection');
  };

  // 載入中狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入檢測詳情中...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              載入檢測詳情失敗
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                返回歷史記錄
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                重新載入
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🔧 修改：頁面標題使用日期時間 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <button
                  onClick={handleBack}
                  className="hover:text-gray-700 focus:outline-none"
                >
                  歷史記錄
                </button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900">檢測詳情</span>
              </nav>

              {/* 🔧 主標題使用格式化的日期時間 */}
              <h1 className="text-3xl font-bold text-gray-900">
                {formatDetectionTitle(detectionData?.createdAt)}
              </h1>

              {/* 🔧 副標題顯示更詳細的時間和ID */}
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                {detectionData?.createdAt && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDetailedTime(detectionData.createdAt)}
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  記錄ID: #{id}
                </span>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回列表
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReDetect}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 0v4m0-4h4m-4 0H8" />
                </svg>
                新檢測
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 檢測結果內容 */}
        {detectionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DetectionResult
              results={detectionData}
              originalImage={detectionData.originalImage}
              onReset={handleBack} // 重置時返回歷史列表
              isHistoryView={true} // 標記為歷史檢視模式
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HistoryDetailPage;
