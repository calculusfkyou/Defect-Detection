import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { toast, Toaster } from 'react-hot-toast';

// Layout 組件
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Profile 組件
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileActivityLog from '../components/profile/ProfileActivityLog';
import ProfileSecurity from '../components/profile/ProfileSecurity';
// import ProfileSettings from '../components/profile/ProfileSettings';
import ProfileEditModal from '../components/profile/ProfileEditModal';

// UI 組件
import Spinner from '../components/ui/Spinner';

// Hooks
import useProfile from '../hooks/useProfile';

const ProfilePage = () => {
  const {
    // 數據
    profile,
    activities,
    activityPagination,
    stats,
    topDefectTypes,

    // 狀態
    loading,
    updating,
    changingPassword,
    uploadingAvatar,
    deletingAccount,
    activityLoading,
    error,

    // 操作函數
    updateProfile,
    handleChangePassword,
    handleUploadAvatar,
    fetchActivityLog,
    handleDeleteAccount,
    clearError,

    // 狀態檢查
    hasProfile,
    canLoadMoreActivities
  } = useProfile();

  // 本地狀態
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  // 標籤配置
  const tabs = [
    { id: 'overview', label: '概覽', icon: '📊' },
    { id: 'info', label: '基本資料', icon: '👤' },
    { id: 'activity', label: '活動日誌', icon: '📋' },
    { id: 'security', label: '安全設定', icon: '🔒' },
    // { id: 'settings', label: '系統設定', icon: '⚙️' }
  ];

  // 處理頭像上傳
  const onUploadAvatar = async (file) => {
    try {
      const result = await handleUploadAvatar(file);
      if (result.success) {
        toast.success('頭像更新成功');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('頭像上傳失敗');
    }
  };

  // 處理個人資料更新
  const onUpdateProfile = async (profileData) => {
    const result = await updateProfile(profileData);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result;
  };

  // 處理密碼更改
  const onChangePassword = async (passwordData) => {
    return await handleChangePassword(passwordData);
  };

  // 處理帳戶刪除
  const onDeleteAccount = async (deleteData) => {
    return await handleDeleteAccount(deleteData);
  };

  // 載入更多活動記錄
  const onLoadMoreActivities = () => {
    const nextPage = activityPagination.page + 1;
    fetchActivityLog(nextPage);
  };

  // 錯誤處理
  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // 載入狀態
  if (loading && !hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>個人資料 - PCB瑕疵檢測系統</title>
        <meta name="description" content="管理您的個人資料、查看統計數據和活動記錄" />
      </Helmet>

      <Navbar />
      <Toaster position="top-right" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
          <p className="mt-2 text-gray-600">
            管理您的帳戶設定、查看使用統計和活動記錄
          </p>
        </motion.div>

        {/* 個人資料頭部 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ProfileHeader
            profile={profile}
            onUploadAvatar={onUploadAvatar}
            uploadingAvatar={uploadingAvatar}
            onEditProfile={() => setShowEditModal(true)}
          />
        </motion.div>

        {/* 標籤導航 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* 標籤內容 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <ProfileStats
              stats={stats}
              topDefectTypes={topDefectTypes}
            />
          )}

          {activeTab === 'info' && (
            <ProfileInfo
              profile={profile}
              onEdit={() => setShowEditModal(true)}
            />
          )}

          {activeTab === 'activity' && (
            <ProfileActivityLog
              activities={activities}
              activityLoading={activityLoading}
              pagination={activityPagination}
              onLoadMore={onLoadMoreActivities}
              canLoadMore={canLoadMoreActivities}
            />
          )}

          {activeTab === 'security' && (
            <ProfileSecurity
              onChangePassword={onChangePassword}
              onDeleteAccount={onDeleteAccount}
              changingPassword={changingPassword}
              deletingAccount={deletingAccount}
            />
          )}

          {/* {activeTab === 'settings' && (
            <ProfileSettings
              profile={profile}
              onUpdateSettings={(settings) => {
                console.log('更新設定:', settings);
                toast.success('設定已保存');
              }}
            />
          )} */}
        </motion.div>
      </main>

      <Footer />

      {/* 編輯個人資料模態框 */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onUpdate={onUpdateProfile}
        onUploadAvatar={onUploadAvatar}
        updating={updating}
        uploadingAvatar={uploadingAvatar}
      />
    </div>
  );
};

export default ProfilePage;
