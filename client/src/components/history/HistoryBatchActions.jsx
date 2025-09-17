import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteConfirmModal from './DeleteConfirmModal';

const HistoryBatchActions = ({
  selectedCount = 0,
  isAllSelected = false,
  onSelectAll,
  onClearSelection,
  onExport,
  onDelete, // 🔧 刪除回調函數
  isExporting = false,
  exportProgress = '',
  isDeleting = false, // 🔧 刪除狀態
  deleteProgress = '' // 🔧 刪除進度
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 🔧 處理刪除確認 - 加強錯誤處理
  const handleDeleteConfirm = async () => {
    try {
      console.log('🗑️ 確認刪除操作，檢查函數:', {
        hasOnDelete: typeof onDelete === 'function',
        onDeleteType: typeof onDelete
      });

      // 🔧 檢查刪除函數是否存在
      if (typeof onDelete !== 'function') {
        console.error('❌ onDelete 不是函數:', onDelete);
        throw new Error('刪除功能尚未實作，請聯繫開發團隊');
      }

      await onDelete();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('❌ 刪除確認失敗:', error);
      // 錯誤處理由父組件處理，這裡只關閉模態框
      setShowDeleteModal(false);

      // 🔧 可選：顯示簡單的錯誤提示
      if (error.message.includes('尚未實作')) {
        alert('刪除功能尚未實作，請聯繫開發團隊');
      }
    }
  };

  // 🔧 處理刪除按鈕點擊
  const handleDeleteClick = () => {
    console.log('🗑️ 點擊刪除按鈕，檢查條件:', {
      selectedCount,
      hasOnDelete: typeof onDelete === 'function',
      isDeleting,
      isExporting
    });

    // 🔧 檢查條件
    if (selectedCount === 0) {
      alert('請先選擇要刪除的項目');
      return;
    }

    if (typeof onDelete !== 'function') {
      alert('刪除功能尚未實作，請聯繫開發團隊');
      return;
    }

    if (isDeleting || isExporting) {
      alert('請等待當前操作完成');
      return;
    }

    setShowDeleteModal(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -50, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border-l-4 border-l-blue-500 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* 左側：選擇狀態與操作 */}
            <div className="flex items-center space-x-4">
              {/* 選擇狀態指示器 */}
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                    {isAllSelected ? '取消全選' : '全選'}
                  </label>
                </motion.div>

                <div className="h-5 w-px bg-gray-300" />

                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                    {selectedCount}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    已選擇 {selectedCount} 個項目
                  </span>
                </div>
              </div>

              {/* 清除選擇按鈕 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClearSelection}
                className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none underline"
              >
                清除選擇
              </motion.button>
            </div>

            {/* 右側：批量操作按鈕 */}
            <div className="flex items-center space-x-3">
              {/* 🔧 刪除進度顯示 */}
              {isDeleting && deleteProgress && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-md text-sm"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                  <span>{deleteProgress}</span>
                </motion.div>
              )}

              {/* 匯出進度顯示 */}
              {isExporting && exportProgress && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  <span>{exportProgress}</span>
                </motion.div>
              )}

              {/* 批量匯出按鈕 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExport}
                disabled={isExporting || isDeleting || selectedCount === 0}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  transition-colors duration-200
                  ${isExporting || isDeleting || selectedCount === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                  }
                `}
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    匯出中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    批量匯出
                    {selectedCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-blue-700 text-white text-xs rounded-full">
                        {selectedCount}
                      </span>
                    )}
                  </>
                )}
              </motion.button>

              {/* 🔧 批量刪除按鈕 - 修復錯誤處理 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteClick} // 🔑 使用新的處理函數
                disabled={isExporting || isDeleting || selectedCount === 0}
                className={`
                  inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                  transition-colors duration-200
                  ${isExporting || isDeleting || selectedCount === 0
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                  }
                `}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />
                    刪除中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    刪除選中項目
                    {selectedCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                        {selectedCount}
                      </span>
                    )}
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* 選擇進度條 */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
            className="mt-3 w-full bg-gray-200 rounded-full h-1"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((selectedCount / 10) * 100, 100)}%` }}
              transition={{ duration: 0.3 }}
              className="bg-blue-600 h-1 rounded-full"
            />
          </motion.div>

          {/* 操作提示 */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              選擇項目後可進行批量操作
            </span>
            <span>
              支援：ZIP 匯出、批量刪除
            </span>
          </div>

          {/* 🔧 調試訊息（開發環境） */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <strong>調試訊息:</strong>
              <div>onDelete 類型: {typeof onDelete}</div>
              <div>selectedCount: {selectedCount}</div>
              <div>isDeleting: {isDeleting.toString()}</div>
            </div>
          )} */}
        </motion.div>
      </AnimatePresence>

      {/* 🔧 刪除確認對話框 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        selectedCount={selectedCount}
        isDeleting={isDeleting}
        deleteProgress={deleteProgress}
      />
    </>
  );
};

export default HistoryBatchActions;
