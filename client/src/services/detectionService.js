import authAxios from '../utils/authAxios';

/**
 * 將圖像檔案上傳並進行瑕疵檢測
 * @param {File|Blob} image - 要檢測的PCB圖像檔案
 * @param {Object} options - 檢測選項
 * @param {number} options.confidenceThreshold - 置信度閾值 (0.0-1.0)
 * @param {string|null} options.userId - 用戶ID (如果已登入)
 * @returns {Promise<Object>} 檢測結果
 */
export const detectDefectsInImage = async (image, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('image', image);

    if (options.confidenceThreshold) {
      formData.append('confidenceThreshold', options.confidenceThreshold);
    }

    if (options.userId) {
      formData.append('userId', options.userId);
    }

    const response = await authAxios.post('/api/detection', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60秒超時，因為檢測可能需要時間
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('檢測失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || '檢測服務暫時不可用，請稍後再試',
    };
  }
};

/**
 * 保存檢測結果到用戶歷史記錄
 * @param {Object} detectionResult - 檢測結果
 * @param {string} userId - 用戶ID
 * @returns {Promise<Object>} 保存操作結果
 */
export const saveDetectionResult = async (detectionResult, userId) => {
  try {
    const response = await authAxios.post('/api/detection/save', {
      detectionResult,
      userId,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('保存結果失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || '保存結果失敗，請稍後再試',
    };
  }
};

/**
 * 獲取用戶的檢測歷史記錄
 * @param {Object} options - 分頁選項
 * @param {number} options.page - 頁碼
 * @param {number} options.limit - 每頁數量
 * @returns {Promise<Object>} 歷史記錄數據
 */
export const getUserDetectionHistory = async (options = { page: 1, limit: 10 }) => {
  try {
    const response = await authAxios.get('/api/detection/history', {
      params: options,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('獲取歷史記錄失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || '無法獲取檢測歷史記錄',
    };
  }
};

/**
 * 獲取特定的檢測記錄詳情
 * @param {string} detectionId - 檢測記錄ID
 * @returns {Promise<Object>} 檢測記錄詳情
 */
export const getDetectionDetails = async (detectionId) => {
  try {
    const response = await authAxios.get(`/api/detection/${detectionId}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('獲取檢測詳情失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || '無法獲取檢測詳情',
    };
  }
};
