import { useState, useEffect, useCallback } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserActivityLog,
  uploadAvatar,
  deleteUserAccount
} from '../services/profileService';
import useAuth from './useAuth';

/**
 * 個人資料管理的自定義Hook
 */
const useProfile = () => {
  const { user, refreshUser, logout } = useAuth();

  // 基本狀態
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 操作狀態
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // 活動日誌狀態
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPagination, setActivityPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  /**
   * 獲取個人資料
   */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 Hook: 獲取個人資料');

      const result = await getUserProfile();

      if (result.success) {
        setProfile(result.data);
        console.log('✅ Hook: 個人資料獲取成功:', result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Hook: 獲取個人資料失敗:', err);
      setError(err.message || '獲取個人資料失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 更新個人資料
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      setUpdating(true);
      setError(null);

      console.log('🔧 Hook: 更新個人資料');

      const result = await updateUserProfile(profileData);

      if (result.success) {
        // 更新本地狀態
        setProfile(prev => ({
          ...prev,
          user: {
            ...prev.user,
            ...result.data.user
          }
        }));

        // 刷新全局用戶狀態
        await refreshUser();

        console.log('✅ Hook: 個人資料更新成功');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Hook: 更新個人資料失敗:', err);
      setError(err.message || '更新個人資料失敗');
      return { success: false, message: err.message };
    } finally {
      setUpdating(false);
    }
  }, [refreshUser]);

  /**
   * 更改密碼
   */
  const handleChangePassword = useCallback(async (passwordData) => {
    try {
      setChangingPassword(true);
      setError(null);

      console.log('🔐 Hook: 更改密碼');

      const result = await changePassword(passwordData);

      if (result.success) {
        console.log('✅ Hook: 密碼更改成功');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Hook: 更改密碼失敗:', err);
      setError(err.message || '更改密碼失敗');
      return { success: false, message: err.message };
    } finally {
      setChangingPassword(false);
    }
  }, []);

  /**
   * 上傳頭像
   */
  const handleUploadAvatar = useCallback(async (file) => {
    try {
      setUploadingAvatar(true);
      setError(null);

      console.log('📸 Hook: 上傳頭像');

      const result = await uploadAvatar(file);

      if (result.success) {
        // 更新本地狀態
        setProfile(prev => ({
          ...prev,
          user: {
            ...prev.user,
            avatar: result.data.avatar
          }
        }));

        // 刷新全局用戶狀態
        await refreshUser();

        console.log('✅ Hook: 頭像上傳成功');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Hook: 上傳頭像失敗:', err);
      setError(err.message || '上傳頭像失敗');
      return { success: false, message: err.message };
    } finally {
      setUploadingAvatar(false);
    }
  }, [refreshUser]);

  /**
   * 獲取活動日誌
   */
  const fetchActivityLog = useCallback(async (page = 1) => {
    try {
      setActivityLoading(true);

      console.log('📋 Hook: 獲取活動日誌, 頁面:', page);

      const result = await getUserActivityLog({
        page,
        limit: activityPagination.limit
      });

      if (result.success) {
        if (page === 1) {
          setActivities(result.data.activities);
        } else {
          setActivities(prev => [...prev, ...result.data.activities]);
        }

        setActivityPagination(result.data.pagination);
        console.log('✅ Hook: 活動日誌獲取成功');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Hook: 獲取活動日誌失敗:', err);
      if (page === 1) {
        setError(err.message || '獲取活動日誌失敗');
      }
    } finally {
      setActivityLoading(false);
    }
  }, [activityPagination.limit]);

  /**
   * 刪除帳戶
   */
  const handleDeleteAccount = useCallback(async (deleteData) => {
    try {
      setDeletingAccount(true);
      setError(null);

      console.log('🗑️ Hook: 刪除帳戶');

      const result = await deleteUserAccount(deleteData);

      if (result.success) {
        // 登出並重定向
        await logout();
        console.log('✅ Hook: 帳戶刪除成功');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('❌ Hook: 刪除帳戶失敗:', err);
      setError(err.message || '刪除帳戶失敗');
      return { success: false, message: err.message };
    } finally {
      setDeletingAccount(false);
    }
  }, [logout]);

  /**
   * 刷新所有數據
   */
  const refreshAll = useCallback(() => {
    fetchProfile();
    fetchActivityLog(1);
  }, [fetchProfile, fetchActivityLog]);

  /**
   * 重置錯誤狀態
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 初始化時獲取數據
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchActivityLog(1);
    }
  }, [user?.id, fetchProfile, fetchActivityLog]);

  // 便捷的狀態檢查
  const hasProfile = !!profile;
  const hasActivities = activities.length > 0;
  const canLoadMoreActivities = activityPagination.page < activityPagination.pages;

  return {
    // 數據
    profile,
    activities,
    activityPagination,

    // 載入狀態
    loading,
    updating,
    changingPassword,
    uploadingAvatar,
    deletingAccount,
    activityLoading,

    // 錯誤狀態
    error,

    // 操作函數
    fetchProfile,
    updateProfile,
    handleChangePassword,
    handleUploadAvatar,
    fetchActivityLog,
    handleDeleteAccount,

    // 工具函數
    refreshAll,
    clearError,

    // 狀態檢查
    hasProfile,
    hasActivities,
    canLoadMoreActivities,

    // 統計數據（從 profile 中提取）
    stats: profile?.stats || {},
    topDefectTypes: profile?.topDefectTypes || [],
    accountInfo: profile?.accountInfo || {}
  };
};

export default useProfile;
