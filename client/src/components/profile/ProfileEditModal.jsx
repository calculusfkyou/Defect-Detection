import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ProfileEditModal = ({
  isOpen,
  onClose,
  profile,
  onUpdate,
  onUploadAvatar, // 🆕 添加頭像上傳處理函數
  updating = false,
  uploadingAvatar = false // 🆕 添加頭像上傳狀態
}) => {
  const [formData, setFormData] = useState({
    name: profile?.user?.name || ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(profile?.user?.avatar || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // 重置表單數據
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.user.name || ''
      });
      setPreviewAvatar(profile.user.avatar || '');
      setSelectedFile(null);
    }
  }, [profile]);

  // 處理輸入變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理文件選擇
  const handleFileSelect = (file) => {
    if (!file) return;

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片文件');
      return;
    }

    // 檢查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('圖片大小不能超過 5MB');
      return;
    }

    // 存儲文件對象並創建預覽 URL
    setSelectedFile(file);

    // 創建臨時預覽 URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewAvatar(previewUrl);
  };

  // 處理拖拽
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // 🔧 處理表單提交 - 分別處理基本信息和頭像
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('姓名為必填欄位');
      return;
    }

    try {
      // 1. 先更新基本信息（只有姓名）
      await onUpdate(formData);

      // 2. 如果有選擇新頭像，則上傳頭像
      if (selectedFile && onUploadAvatar) {
        const avatarResult = await onUploadAvatar(selectedFile);
        if (avatarResult.success) {
          toast.success('個人資料和頭像更新成功');
        } else {
          toast.success('個人資料更新成功');
          toast.error('頭像上傳失敗：' + avatarResult.message);
        }
      } else {
        toast.success('個人資料更新成功');
      }

      onClose();
    } catch (error) {
      toast.error(error.message || '更新失敗');
    }
  };

  // 清理預覽 URL
  React.useEffect(() => {
    return () => {
      if (previewAvatar && previewAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  // 獲取頭像顯示內容
  const getAvatarContent = () => {
    if (previewAvatar) {
      return (
        <img
          src={previewAvatar}
          alt="頭像預覽"
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
        {formData.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  編輯個人資料
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 🆕 顯示電子郵件（只讀） */}
                <div className="text-center bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    帳戶電子郵件
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {profile?.user?.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    電子郵件無法更改，作為您的唯一帳戶標識
                  </p>
                </div>

                {/* 頭像上傳 */}
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    頭像 {selectedFile && <span className="text-blue-600">(已選擇新圖片)</span>}
                  </label>

                  <div className="flex flex-col items-center space-y-4">
                    {/* 頭像預覽 */}
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                      {getAvatarContent()}
                    </div>

                    {/* 拖拽上傳區域 */}
                    <div
                      className={`
                        w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                        ${dragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingAvatar ? (
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p className="text-sm text-blue-600">上傳中...</p>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-blue-600">點擊上傳</span> 或拖拽圖片到此處
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF 最大 5MB
                          </p>
                        </>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </div>
                </div>

                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名 *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="請輸入姓名"
                  />
                </div>

                {/* 🗑️ 移除電子郵件輸入欄位 */}

                {/* 按鈕 */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={updating || uploadingAvatar}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        更新中...
                      </div>
                    ) : (
                      '保存更改'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileEditModal;
