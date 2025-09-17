import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import HistoryHeader from '../components/history/HistoryHeader';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryList from '../components/history/HistoryList';
import HistoryBatchActions from '../components/history/HistoryBatchActions';
import HistoryEmptyState from '../components/history/HistoryEmptyState';
import useAuth from '../hooks/useAuth';
import useHistory from '../hooks/useHistory';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const {
    // 數據
    history,
    loading,
    error,
    pagination,
    filters,
    stats,
    refreshStats,

    // 🔧 分頁功能
    goToPage,
    goToPreviousPage,
    goToNextPage,

    // 選擇狀態
    selectedItems,
    selectedCount,
    isAllSelected,

    // 匯出狀態
    isExporting,
    exportProgress,

    // 刪除狀態
    isDeleting,
    deleteProgress,

    // 操作函數
    handleFilterChange,
    handleSearch,
    handleSort,

    // 選擇操作
    toggleItemSelection,
    toggleSelectAll,
    clearSelection,

    // 批量操作
    exportSelected,
    deleteSelected,

    // 工具函數
    refreshData,
    clearFilters,

    // 狀態檢查
    hasNextPage,
    hasPreviousPage,
    isEmpty,
    hasActiveFilters,
  } = useHistory();

  // 刪除狀態管理
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  // 處理批量刪除
  const handleDelete = async () => {
    try {
      setDeleteError(null);
      console.log('🗑️ 開始批量刪除操作');

      if (typeof deleteSelected !== 'function') {
        throw new Error('刪除功能尚未實作，請聯繫開發團隊');
      }

      const result = await deleteSelected();

      if (result.success) {
        setDeleteSuccess(`成功刪除 ${result.successCount} 個檢測記錄${result.failCount > 0 ? `，${result.failCount} 個失敗` : ''}！`);
        setTimeout(() => setDeleteSuccess(null), 5000);
      }
    } catch (err) {
      console.error('❌ 刪除失敗:', err);
      setDeleteError(err.message || '刪除失敗，請稍後再試');
      setTimeout(() => setDeleteError(null), 5000);
    }
  };

  // 檢查用戶登入狀態
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('🔒 用戶未登入，顯示登入提示');
      setShowLoginPrompt(true);
    } else {
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);

  // 處理匯出操作
  const handleExport = async () => {
    try {
      console.log('📦 開始批量匯出操作');

      if (typeof exportSelected !== 'function') {
        throw new Error('匯出功能尚未實作，請聯繫開發團隊');
      }

      const result = await exportSelected();
      if (result.success) {
        clearSelection();
      }
    } catch (err) {
      console.error('❌ 匯出失敗:', err);
    }
  };

  // 處理項目點擊（進入詳細頁面）
  const handleItemClick = (detectionId) => {
    console.log('📄 進入檢測詳情頁面:', detectionId);
    navigate(`/history/${detectionId}`);
  };

  // 登入提示對話框
  const LoginPromptModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setShowLoginPrompt(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            需要登入才能查看檢測歷史
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            請登入您的帳戶以查看您的檢測記錄和歷史報告。
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              立即登入
            </button>

            <button
              onClick={() => navigate('/register')}
              className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              註冊帳戶
            </button>
          </div>

          <button
            onClick={() => setShowLoginPrompt(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            暫時關閉
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HistoryHeader
          totalCount={pagination.total}
          selectedCount={selectedCount}
          loading={loading}
          stats={stats}
        />

        {/* 篩選器 */}
        {isAuthenticated() && (
          <HistoryFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onSort={handleSort}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            loading={loading}
          />
        )}

        {/* 🔧 移除：分頁模式切換控制 */}

        {/* 批量操作工具欄 */}
        {isAuthenticated() && selectedCount > 0 && (
          <HistoryBatchActions
            selectedCount={selectedCount}
            isAllSelected={isAllSelected}
            onSelectAll={toggleSelectAll}
            onClearSelection={clearSelection}
            onExport={handleExport}
            onDelete={handleDelete}
            isExporting={isExporting}
            exportProgress={exportProgress}
            isDeleting={isDeleting}
            deleteProgress={deleteProgress}
          />
        )}

        {/* 刪除成功訊息 */}
        {deleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-md bg-green-50 text-green-800 border border-green-200"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{deleteSuccess}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 刪除錯誤訊息 */}
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-md bg-red-50 text-red-800 border border-red-200"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{deleteError}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 主要內容區域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          {/* 錯誤狀態 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    獲取檢測歷史時發生錯誤
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={refreshData}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                    >
                      重新載入
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 歷史記錄列表 */}
          {isAuthenticated() && (
            <>
              {isEmpty && !error ? (
                <HistoryEmptyState
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={clearFilters}
                  onNavigateToDetection={() => navigate('/detection')}
                />
              ) : (
                <HistoryList
                  history={history}
                  loading={loading}
                  selectedItems={selectedItems}
                  onItemClick={handleItemClick}
                  onItemSelect={toggleItemSelection}
                  // 🔧 分頁相關props
                  pagination={pagination}
                  onPageChange={goToPage}
                  onPreviousPage={goToPreviousPage}
                  onNextPage={goToNextPage}
                />
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* 登入提示模態框 */}
      {showLoginPrompt && <LoginPromptModal />}
    </div>
  );
};

export default HistoryPage;
