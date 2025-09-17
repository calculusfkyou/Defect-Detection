import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUserDetectionHistory,
  getDetectionDetails,
  exportHistoryDetectionResult,
  getUserStats,
  exportBatchDetectionResults,
  batchDeleteDetectionRecords,
  deleteDetectionRecord
} from '../services/detectionService';
import useAuth from './useAuth';

/**
 * 歷史記錄管理的自定義Hook
 */
const useHistory = () => {
  const { user, isAuthenticated } = useAuth();

  // 基本狀態
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 刪除狀態
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState('');

  // 分頁狀態
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // 🔧 修復：篩選和搜索狀態 - 使用 useRef 來避免閉包問題
  const [filters, setFilters] = useState({
    search: '',
    dateRange: '',
    defectType: '',
    hasDefects: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // 🔧 新增：使用 ref 來存儲最新的 filters 狀態
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // 批量操作狀態
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  // 統計相關狀態
  const [stats, setStats] = useState({
    totalDetections: 0,
    monthlyDetections: 0,
    totalDefects: 0,
    monthlyDefects: 0,
    averageConfidence: 0,
    qualityRate: 0,
    loading: false,
    error: null
  });

  /**
   * 獲取統計數據
   */
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated()) {
      console.log('🔒 用戶未登入，跳過統計數據獲取');
      return;
    }

    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      console.log('📊 獲取統計數據');
      const result = await getUserStats();

      if (result.success) {
        setStats(prev => ({
          ...prev,
          ...result.data,
          loading: false
        }));
        console.log('✅ 統計數據獲取成功:', result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ 獲取統計數據失敗:', err);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: err.message || '獲取統計數據失敗'
      }));
    }
  }, [isAuthenticated]);

  /**
   * 🔧 修復：獲取歷史記錄列表 - 使用最新的篩選條件
   */
  const fetchHistory = useCallback(async (page = 1, customFilters = null) => {
    if (!isAuthenticated()) {
      console.log('🔒 用戶未登入，跳過歷史記錄獲取');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 🔧 使用傳入的 customFilters 或最新的 filters 狀態
      const currentFilters = customFilters || filtersRef.current;

      console.log('📋 獲取歷史記錄，頁面:', page, '篩選條件:', currentFilters);

      const options = {
        page,
        limit: pagination.limit,
        ...currentFilters  // 🔑 使用最新的篩選條件
      };

      const result = await getUserDetectionHistory(options);

      if (result.success) {
        setHistory(result.data.history);

        setPagination(prev => ({
          ...prev,
          page: result.data.pagination.page,
          total: result.data.pagination.total,
          pages: result.data.pagination.pages
        }));

        console.log('✅ 歷史記錄獲取成功:', {
          total: result.data.pagination.total,
          currentPage: result.data.pagination.page,
          totalPages: result.data.pagination.pages,
          appliedFilters: currentFilters
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ 獲取歷史記錄失敗:', err);
      setError(err.message || '獲取歷史記錄失敗');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagination.limit]); // 🔧 移除 filters 依賴

  /**
   * 跳轉到指定頁面
   */
  const goToPage = useCallback((targetPage) => {
    if (targetPage < 1 || targetPage > pagination.pages) {
      console.warn('⚠️ 無效的頁面號碼:', targetPage);
      return;
    }

    if (targetPage === pagination.page) {
      console.log('ℹ️ 已經在當前頁面');
      return;
    }

    console.log('📄 跳轉到頁面:', targetPage);
    fetchHistory(targetPage);
  }, [pagination.pages, pagination.page, fetchHistory]);

  /**
   * 上一頁
   */
  const goToPreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  /**
   * 下一頁
   */
  const goToNextPage = useCallback(() => {
    if (pagination.page < pagination.pages) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.pages, goToPage]);

  /**
   * 獲取檢測記錄詳情
   */
  const fetchDetectionDetail = useCallback(async (detectionId) => {
    if (!isAuthenticated()) {
      throw new Error('請先登入');
    }

    try {
      console.log('📄 獲取檢測詳情:', detectionId);

      const result = await getDetectionDetails(detectionId);

      if (result.success) {
        console.log('✅ 檢測詳情獲取成功:', {
          hasData: !!result.data,
          defectsCount: result.data?.defects?.length || 0,
          hasOriginalImage: !!result.data?.originalImage,
          hasResultImage: !!result.data?.resultImage
        });
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ 獲取檢測詳情失敗:', err);
      throw err;
    }
  }, [isAuthenticated]);

  /**
   * 🔧 修復：處理篩選變更 - 立即應用新的篩選條件
   */
  const handleFilterChange = useCallback((newFilters) => {
    console.log('🔍 篩選條件變更:', newFilters);

    // 🔧 合併新的篩選條件並立即更新狀態
    const updatedFilters = { ...filtersRef.current, ...newFilters };

    console.log('🔍 完整篩選條件:', updatedFilters);

    // 更新狀態
    setFilters(updatedFilters);
    filtersRef.current = updatedFilters;

    // 重置到第一頁
    setPagination(prev => ({ ...prev, page: 1 }));

    // 🔑 立即使用新的篩選條件獲取數據
    fetchHistory(1, updatedFilters);
  }, [fetchHistory]);

  /**
   * 處理搜索
   */
  const handleSearch = useCallback((searchQuery) => {
    console.log('🔍 搜索查詢:', searchQuery);
    handleFilterChange({ search: searchQuery });
  }, [handleFilterChange]);

  /**
   * 處理排序
   */
  const handleSort = useCallback((sortBy, sortOrder) => {
    console.log('📊 排序變更:', { sortBy, sortOrder });
    handleFilterChange({ sortBy, sortOrder });
  }, [handleFilterChange]);

  /**
   * 處理項目選擇
   */
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      console.log('✅ 項目選擇變更:', Array.from(newSelected));
      return newSelected;
    });
  }, []);

  /**
   * 全選/取消全選
   */
  const toggleSelectAll = useCallback(() => {
    setSelectedItems(prev => {
      if (prev.size === history.length) {
        console.log('❌ 取消全選');
        return new Set();
      } else {
        const allIds = new Set(history.map(item => item.id));
        console.log('✅ 全選項目:', Array.from(allIds));
        return allIds;
      }
    });
  }, [history]);

  /**
   * 清除選擇
   */
  const clearSelection = useCallback(() => {
    console.log('🧹 清除所有選擇');
    setSelectedItems(new Set());
  }, []);

  /**
   * 批量匯出功能
   */
  const exportSelected = useCallback(async () => {
    if (selectedItems.size === 0) {
      throw new Error('請選擇要匯出的項目');
    }

    try {
      setIsExporting(true);
      setExportProgress('準備批量匯出...');

      const selectedIds = Array.from(selectedItems);
      console.log('📦 開始批量匯出:', selectedIds);

      setExportProgress(`正在處理 ${selectedIds.length} 個檢測結果...`);

      if (typeof exportBatchDetectionResults === 'function') {
        const result = await exportBatchDetectionResults(selectedIds);

        if (result.success) {
          setExportProgress('批量匯出完成！');
          setTimeout(() => setExportProgress(''), 3000);
          return { success: true, message: result.message };
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('批量匯出功能尚未實作，請聯繫開發團隊');
      }

    } catch (err) {
      console.error('❌ 批量匯出失敗:', err);
      setExportProgress('');
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [selectedItems]);

  /**
   * 刷新數據
   */
  const refreshData = useCallback(() => {
    console.log('🔄 刷新歷史記錄數據');
    setSelectedItems(new Set());
    fetchHistory(1);
    fetchStats();
  }, [fetchHistory, fetchStats]);

  /**
   * 🔧 修復：清除篩選 - 立即應用清空的篩選條件
   */
  const clearFilters = useCallback(() => {
    console.log('🧹 清除所有篩選條件');

    const emptyFilters = {
      search: '',
      dateRange: '',
      defectType: '',
      hasDefects: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    setFilters(emptyFilters);
    filtersRef.current = emptyFilters;
    setPagination(prev => ({ ...prev, page: 1 }));

    // 🔑 立即使用清空的篩選條件獲取數據
    fetchHistory(1, emptyFilters);
  }, [fetchHistory]);

  /**
   * 批量刪除選中項目
   */
  const deleteSelected = useCallback(async () => {
    if (selectedItems.size === 0) {
      throw new Error('請選擇要刪除的項目');
    }

    try {
      setIsDeleting(true);
      setDeleteProgress('準備刪除...');

      const selectedIds = Array.from(selectedItems);
      console.log('🗑️ 開始批量刪除:', selectedIds);

      setDeleteProgress(`正在刪除 ${selectedIds.length} 個檢測記錄...`);

      const result = await batchDeleteDetectionRecords(selectedIds);

      if (result.success) {
        setDeleteProgress('刪除完成！');

        // 清除選擇並刷新數據
        setSelectedItems(new Set());
        await refreshData();

        setTimeout(() => setDeleteProgress(''), 3000);
        return {
          success: true,
          message: result.message,
          successCount: result.data.successCount,
          failCount: result.data.failCount
        };
      } else {
        throw new Error(result.message);
      }

    } catch (err) {
      console.error('❌ 批量刪除失敗:', err);
      setDeleteProgress('');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedItems, refreshData]);

  /**
   * 刪除單個項目
   */
  const deleteSingle = useCallback(async (detectionId) => {
    try {
      console.log('🗑️ 刪除單個記錄:', detectionId);

      const result = await deleteDetectionRecord(detectionId);

      if (result.success) {
        setSelectedItems(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(detectionId);
          return newSelected;
        });

        await refreshData();
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message);
      }

    } catch (err) {
      console.error('❌ 刪除單個記錄失敗:', err);
      throw err;
    }
  }, [refreshData]);

  // 🔧 修復：在用戶狀態變更時獲取統計數據
  useEffect(() => {
    if (isAuthenticated()) {
      fetchStats();
    } else {
      setStats({
        totalDetections: 0,
        monthlyDetections: 0,
        totalDefects: 0,
        monthlyDefects: 0,
        averageConfidence: 0,
        qualityRate: 0,
        loading: false,
        error: null
      });
    }
  }, [user?.id, isAuthenticated, fetchStats]);

  // 🔧 修復：用戶狀態變更時重新獲取數據
  useEffect(() => {
    if (isAuthenticated()) {
      fetchHistory(1);
    } else {
      setHistory([]);
      setSelectedItems(new Set());
      setError(null);
    }
  }, [user?.id, isAuthenticated]); // 🔧 移除 fetchHistory 依賴避免循環

  return {
    // 數據
    history,
    loading,
    error,
    pagination,
    filters,

    // 分頁功能
    goToPage,
    goToPreviousPage,
    goToNextPage,

    // 選擇狀態
    selectedItems,
    selectedCount: selectedItems.size,
    isAllSelected: selectedItems.size === history.length && history.length > 0,

    // 匯出狀態
    isExporting,
    exportProgress,

    // 操作函數
    fetchHistory,
    fetchDetectionDetail,
    handleFilterChange,
    handleSearch,
    handleSort,

    // 選擇操作
    toggleItemSelection,
    toggleSelectAll,
    clearSelection,

    // 批量操作
    exportSelected,

    // 工具函數
    refreshData,
    clearFilters,

    // 狀態檢查
    hasPreviousPage: pagination.page > 1,
    hasNextPage: pagination.page < pagination.pages,
    isEmpty: history.length === 0 && !loading,
    hasActiveFilters: Object.values(filters).some(value =>
      value !== '' && value !== 'createdAt' && value !== 'desc'
    ),

    // 刪除相關返回值
    isDeleting,
    deleteProgress,
    deleteSelected,
    deleteSingle,

    // 統計數據
    stats,
    fetchStats,
    refreshStats: fetchStats
  };
};

export default useHistory;
