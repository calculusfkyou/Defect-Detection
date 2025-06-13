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

    console.log('📤 發送檢測請求:', {
      imageSize: image.size,
      imageType: image.type,
      confidenceThreshold: options.confidenceThreshold
    });

    const response = await authAxios.post('/api/detection', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60秒超時，因為檢測可能需要時間
    });

    console.log('📥 收到檢測響應:', {
      success: response.data.success,
      dataKeys: Object.keys(response.data.data || {}),
      defectsCount: response.data.data?.defects?.length || 0
    });

    // 🔍 詳細檢查響應數據
    if (response.data.success && response.data.data) {
      console.log('🔍 響應數據詳情:', {
        defects: response.data.data.defects,
        defectsLength: response.data.data.defects?.length,
        summary: response.data.data.summary,
        hasOriginalImage: !!response.data.data.originalImage,
        hasResultImage: !!response.data.data.resultImage
      });

      // 檢查每個瑕疵
      if (Array.isArray(response.data.data.defects) && response.data.data.defects.length > 0) {
        console.log('🔍 瑕疵數據樣本:', response.data.data.defects[0]);
      }
    }

    return {
      success: true,
      data: response.data.data,  // 🔑 確保返回的是 response.data.data
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
 * 🔧 改進的匯出檢測結果函數 - 支持下載確認
 * @param {Object} results - 檢測結果
 * @returns {Promise<Object>}
 */
export const exportDetectionResults = async (results) => {
  try {
    console.log('📁 開始匯出檢測結果...');

    const response = await authAxios.post('/api/detection/export', {
      results
    }, {
      responseType: 'blob', // 重要：設置響應類型為blob
      timeout: 30000
    });

    // 創建下載鏈接
    const blob = new Blob([response.data], { type: 'application/zip' });
    const downloadUrl = window.URL.createObjectURL(blob);

    // 從響應頭獲取檔案名稱
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'detection_result.zip';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    }

    // 🔧 創建 Promise 來等待用戶下載確認
    const downloadConfirmation = new Promise((resolve, reject) => {
      try {
        // 創建臨時下載鏈接
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;

        // 🔧 監聽下載事件
        let downloadStarted = false;
        let downloadTimeout;

        // 設置下載超時（30秒）
        downloadTimeout = setTimeout(() => {
          if (!downloadStarted) {
            console.log('⏰ 下載超時，用戶可能取消了下載');
            resolve({ downloaded: false, timeout: true });
          }
        }, 30000);

        // 監聽 focus 事件來檢測下載是否開始
        const handleFocus = () => {
          // 延遲檢查，給瀏覽器時間處理下載
          setTimeout(() => {
            downloadStarted = true;
            clearTimeout(downloadTimeout);
            window.removeEventListener('focus', handleFocus);

            console.log('✅ 檢測到用戶返回頁面，確認下載已開始');
            resolve({ downloaded: true, timeout: false });
          }, 1000);
        };

        // 監聽頁面重新獲得焦點（用戶從下載對話框返回）
        window.addEventListener('focus', handleFocus);

        // 觸發下載
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('📥 下載已觸發，等待用戶確認...');

        // 如果是移動設備或某些瀏覽器，可能不會觸發 focus 事件
        // 所以我們也設置一個較短的備用計時器
        setTimeout(() => {
          if (!downloadStarted) {
            downloadStarted = true;
            clearTimeout(downloadTimeout);
            window.removeEventListener('focus', handleFocus);

            console.log('⚡ 備用確認：假設下載已開始');
            resolve({ downloaded: true, timeout: false });
          }
        }, 3000);

      } catch (error) {
        console.error('❌ 下載過程發生錯誤:', error);
        reject(error);
      }
    });

    // 等待下載確認
    const downloadResult = await downloadConfirmation;

    // 清理 URL
    window.URL.revokeObjectURL(downloadUrl);

    if (downloadResult.downloaded) {
      console.log('✅ 檢測結果匯出成功:', fileName);
      return {
        success: true,
        fileName,
        message: '檢測結果已成功匯出！ZIP 檔案已下載到您的下載資料夾。'
      };
    } else if (downloadResult.timeout) {
      console.log('⚠️ 下載超時');
      return {
        success: false,
        message: '下載超時，請檢查瀏覽器設定並重試'
      };
    } else {
      console.log('⚠️ 下載可能被取消');
      return {
        success: false,
        message: '下載可能被取消，請重試'
      };
    }

  } catch (error) {
    console.error('❌ 匯出檢測結果失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || '匯出失敗，請稍後再試'
    };
  }
};

/**
 * 🔧 改進的匯出歷史檢測結果函數 - 支持下載確認
 * @param {string} detectionId - 檢測記錄ID
 * @returns {Promise<Object>}
 */
export const exportHistoryDetectionResult = async (detectionId) => {
  try {
    console.log('📁 開始匯出歷史檢測結果:', detectionId);

    const response = await authAxios.get(`/api/detection/export/${detectionId}`, {
      responseType: 'blob',
      timeout: 30000
    });

    // 創建下載鏈接
    const blob = new Blob([response.data], { type: 'application/zip' });
    const downloadUrl = window.URL.createObjectURL(blob);

    // 從響應頭獲取檔案名稱
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `detection_result_${detectionId}.zip`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    }

    // 🔧 創建 Promise 來等待用戶下載確認
    const downloadConfirmation = new Promise((resolve, reject) => {
      try {
        // 創建臨時下載鏈接
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;

        // 🔧 監聽下載事件
        let downloadStarted = false;
        let downloadTimeout;

        // 設置下載超時（30秒）
        downloadTimeout = setTimeout(() => {
          if (!downloadStarted) {
            console.log('⏰ 下載超時，用戶可能取消了下載');
            resolve({ downloaded: false, timeout: true });
          }
        }, 30000);

        // 監聽 focus 事件來檢測下載是否開始
        const handleFocus = () => {
          // 延遲檢查，給瀏覽器時間處理下載
          setTimeout(() => {
            downloadStarted = true;
            clearTimeout(downloadTimeout);
            window.removeEventListener('focus', handleFocus);

            console.log('✅ 檢測到用戶返回頁面，確認下載已開始');
            resolve({ downloaded: true, timeout: false });
          }, 1000);
        };

        // 監聽頁面重新獲得焦點（用戶從下載對話框返回）
        window.addEventListener('focus', handleFocus);

        // 觸發下載
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('📥 下載已觸發，等待用戶確認...');

        // 備用確認機制
        setTimeout(() => {
          if (!downloadStarted) {
            downloadStarted = true;
            clearTimeout(downloadTimeout);
            window.removeEventListener('focus', handleFocus);

            console.log('⚡ 備用確認：假設下載已開始');
            resolve({ downloaded: true, timeout: false });
          }
        }, 3000);

      } catch (error) {
        console.error('❌ 下載過程發生錯誤:', error);
        reject(error);
      }
    });

    // 等待下載確認
    const downloadResult = await downloadConfirmation;

    // 清理 URL
    window.URL.revokeObjectURL(downloadUrl);

    if (downloadResult.downloaded) {
      console.log('✅ 歷史檢測結果匯出成功:', fileName);
      return {
        success: true,
        fileName,
        message: '歷史檢測結果已成功匯出！'
      };
    } else if (downloadResult.timeout) {
      console.log('⚠️ 下載超時');
      return {
        success: false,
        message: '下載超時，請檢查瀏覽器設定並重試'
      };
    } else {
      console.log('⚠️ 下載可能被取消');
      return {
        success: false,
        message: '下載可能被取消，請重試'
      };
    }

  } catch (error) {
    console.error('❌ 匯出歷史檢測結果失敗:', error);
    return {
      success: false,
      message: error.response?.data?.message || '匯出失敗，請稍後再試'
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
    const response = await authAxios.get(`/api/detection/details/${detectionId}`);

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
