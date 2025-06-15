import { useState, useEffect, useCallback } from 'react';
import { getRecentDetections } from '../services/detectionService';
import useAuth from './useAuth';

/**
 * 最近檢測記錄的自定義Hook
 */
const useRecentDetections = (limit = 5) => {
  const { user, isAuthenticated } = useAuth();

  const [data, setData] = useState({
    recentDetections: [],
    total: 0,
    hasMore: false,
    isUserSpecific: false,
    message: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔧 獲取最近檢測記錄
  const fetchRecentDetections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 Hook: 獲取最近檢測記錄');

      const result = await getRecentDetections({ limit });

      if (result.success) {
        setData(result.data);
        console.log('✅ Hook: 最近檢測記錄獲取成功:', result.data);
      } else {
        // 即使API返回失敗，也要設置空數據而不是錯誤狀態
        setData(result.data || {
          recentDetections: [],
          total: 0,
          hasMore: false,
          isUserSpecific: false,
          message: result.message || '暫無檢測記錄'
        });
        console.log('⚠️ Hook: API返回失敗但設置空數據:', result.message);
      }
    } catch (err) {
      console.error('❌ Hook: 獲取最近檢測記錄失敗:', err);
      setError(err.message || '獲取最近檢測記錄失敗');

      // 設置預設空數據
      setData({
        recentDetections: [],
        total: 0,
        hasMore: false,
        isUserSpecific: false,
        message: '載入失敗'
      });
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // 🔧 刷新數據
  const refreshData = useCallback(() => {
    fetchRecentDetections();
  }, [fetchRecentDetections]);

  // 🔧 在組件掛載和用戶狀態變更時獲取數據
  useEffect(() => {
    fetchRecentDetections();
  }, [fetchRecentDetections, user?.id]); // 用戶變更時重新獲取

  // 🔧 提供便捷的狀態檢查
  const isEmpty = data.recentDetections.length === 0 && !loading;
  const hasData = data.recentDetections.length > 0;
  const isUserLoggedIn = isAuthenticated();

  return {
    // 數據
    recentDetections: data.recentDetections,
    total: data.total,
    hasMore: data.hasMore,
    isUserSpecific: data.isUserSpecific,
    message: data.message,

    // 狀態
    loading,
    error,
    isEmpty,
    hasData,
    isUserLoggedIn,

    // 操作
    refreshData
  };
};

export default useRecentDetections;
