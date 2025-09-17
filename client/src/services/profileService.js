import axios from 'axios';

// 創建專用的 axios 實例
const authAxios = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000
});

/**
 * 獲取用戶個人資料
 */
export const getUserProfile = async () => {
  try {
    console.log('📋 請求用戶個人資料...');

    const response = await authAxios.get('/profile');

    console.log('✅ 個人資料API響應:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || '獲取個人資料失敗');
    }

  } catch (error) {
    console.error('❌ 獲取個人資料失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || '獲取個人資料失敗',
      data: null
    };
  }
};

/**
 * 更新用戶個人資料
 */
export const updateUserProfile = async (profileData) => {
  try {
    const { name } = profileData;

    console.log('🔧 更新用戶個人資料:', { name, email });

    const response = await authAxios.put('/profile', {
      name,
    });

    console.log('✅ 更新個人資料API響應:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || '更新個人資料失敗');
    }

  } catch (error) {
    console.error('❌ 更新個人資料失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || '更新個人資料失敗'
    };
  }
};


/**
 * 更改密碼
 */
export const changePassword = async (passwordData) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    console.log('🔐 請求更改密碼...');

    const response = await authAxios.put('/profile/password', {
      currentPassword,
      newPassword,
      confirmPassword
    });

    console.log('✅ 更改密碼API響應:', response.data);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || '更改密碼失敗');
    }

  } catch (error) {
    console.error('❌ 更改密碼失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || '更改密碼失敗'
    };
  }
};

/**
 * 獲取用戶活動日誌
 */
export const getUserActivityLog = async (options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;

    console.log('📋 請求用戶活動日誌:', { page, limit });

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await authAxios.get(`/profile/activity?${params}`);

    console.log('✅ 活動日誌API響應:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || '獲取活動日誌失敗');
    }

  } catch (error) {
    console.error('❌ 獲取活動日誌失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || '獲取活動日誌失敗',
      data: {
        activities: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 }
      }
    };
  }
};

/**
 * 上傳用戶頭像
 */
export const uploadAvatar = async (file) => {
  try {
    console.log('📸 上傳用戶頭像:', { filename: file.name, size: file.size });

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await authAxios.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ 上傳頭像API響應:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || '上傳頭像失敗');
    }

  } catch (error) {
    console.error('❌ 上傳頭像失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || '上傳頭像失敗'
    };
  }
};

/**
 * 刪除用戶帳戶
 */
export const deleteUserAccount = async (deleteData) => {
  try {
    const { password, confirmDelete } = deleteData;

    console.log('🗑️ 請求刪除用戶帳戶...');

    const response = await authAxios.delete('/profile', {
      data: {
        password,
        confirmDelete
      }
    });

    console.log('✅ 刪除帳戶API響應:', response.data);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || '刪除帳戶失敗');
    }

  } catch (error) {
    console.error('❌ 刪除帳戶失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || '刪除帳戶失敗'
    };
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserActivityLog,
  uploadAvatar,
  deleteUserAccount
};
