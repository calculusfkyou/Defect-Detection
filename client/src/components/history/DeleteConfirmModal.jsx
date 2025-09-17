import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount = 0,
  isDeleting = false,
  deleteProgress = ''
}) => {

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 標題 */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              確認刪除檢測記錄
            </h3>
          </div>

          {/* 內容 */}
          <div className="mb-6">
            {isDeleting ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-2">正在刪除中...</p>
                {deleteProgress && (
                  <p className="text-sm text-gray-500">{deleteProgress}</p>
                )}
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  您即將刪除 <span className="font-bold text-red-600">{selectedCount}</span> 個檢測記錄。
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-yellow-800">
                        注意事項
                      </h4>
                      <div className="mt-1 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>此操作無法復原</li>
                          <li>將同時刪除相關的瑕疵詳情</li>
                          <li>已匯出的檔案不會受影響</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  請確認您真的要刪除這些記錄。刪除後無法恢復。
                </p>
              </>
            )}
          </div>

          {/* 按鈕 */}
          {!isDeleting && (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                確認刪除
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
