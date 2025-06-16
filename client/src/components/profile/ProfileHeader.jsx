import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';

const ProfileHeader = ({
  profile,
  onUploadAvatar,
  uploadingAvatar = false,
  onEditProfile
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  // 處理頭像上傳
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 直接調用上傳函數，傳入文件對象
      onUploadAvatar(file);
    }
  };

  // 獲取用戶頭像
  const getAvatarContent = () => {
    if (profile?.user?.avatar) {
      return (
        <img
          src={profile.user.avatar}
          alt={profile.user.name}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
        {profile?.user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  // 角色徽章配置
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="error">管理員</Badge>;
      case 'user':
        return <Badge variant="success">一般用戶</Badge>;
      default:
        return <Badge variant="info">用戶</Badge>;
    }
  };

  // 帳戶狀態配置
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">正常</Badge>;
      case 'inactive':
        return <Badge variant="warning">停用</Badge>;
      default:
        return <Badge variant="info">未知</Badge>;
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border overflow-hidden"
    >
      {/* 背景裝飾 */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute bottom-0 right-0 p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEditProfile}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-30 transition-colors backdrop-blur-sm"
          >
            編輯資料
          </motion.button>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="px-6 pb-6">
        <div className="flex items-end space-x-6 -mt-12">
          {/* 頭像 */}
          <div className="relative">
            <motion.div
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden cursor-pointer bg-white"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={handleAvatarClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getAvatarContent()}

              {/* 上傳遮罩 */}
              {(isHovering || uploadingAvatar) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* 隱藏的文件輸入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploadingAvatar}
            />
          </div>

          {/* 用戶信息 */}
          <div className="flex-1 min-w-0 pt-4">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {profile.user.name}
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {profile.user.email}
            </p>

            {/* 徽章 */}
            <div className="flex items-center space-x-2 mt-2">
              {getRoleBadge(profile.user.role)}
              {getStatusBadge(profile.accountInfo.status)}
            </div>
          </div>
        </div>

        {/* 詳細信息 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {profile.stats.totalDetections}
            </div>
            <div className="text-sm text-gray-500">總檢測次數</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {profile.stats.qualityRate}%
            </div>
            <div className="text-sm text-gray-500">品質通過率</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {profile.stats.averageConfidence}%
            </div>
            <div className="text-sm text-gray-500">平均置信度</div>
          </div>
        </div>

        {/* 加入時間和最後登入 */}
        <div className="mt-6 text-sm text-gray-500 flex items-center justify-between">
          <span>
            加入時間：{new Date(profile.accountInfo.joinDate).toLocaleDateString()}
          </span>
          {profile.user.lastLogin && (
            <span>
              最後登入：{new Date(profile.user.lastLogin).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
