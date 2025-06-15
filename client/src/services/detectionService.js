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
 * 🔧 匯出檢測結果函數 - 支持下載確認
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
 * 🔧 匯出歷史檢測結果函數 - 支持下載確認
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
export const getUserDetectionHistory = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      dateRange = '',
      defectType = '',
      hasDefects = '',        // 🔧 簡化：移除數值範圍參數
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    console.log('📋 請求歷史記錄:', options);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    // 🔧 添加基本搜尋參數
    if (search && search.trim()) params.append('search', search.trim());
    if (dateRange) params.append('dateRange', dateRange);
    if (defectType) params.append('defectType', defectType);
    if (hasDefects) params.append('hasDefects', hasDefects);

    const response = await authAxios.get(`/api/detection/history?${params}`);

    console.log('✅ 歷史記錄API響應:', response.data);

    // 🔧 檢查響應格式並確保正確返回
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: {
          history: response.data.data.history || [],
          pagination: response.data.data.pagination || {
            total: 0,
            page: 1,
            limit: 12,
            pages: 0
          },
          searchStats: response.data.data.searchStats || {},
          appliedFilters: response.data.data.appliedFilters || {}
        }
      };
    } else {
      throw new Error(response.data.message || '無效的響應格式');
    }

  } catch (error) {
    console.error('❌ 獲取歷史記錄失敗:', error);

    if (error.response?.status === 401) {
      throw new Error('請先登入才能查看檢測歷史');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      '獲取檢測歷史失敗'
    );
  }
};

/**
 * 獲取特定的檢測記錄詳情
 * @param {string} detectionId - 檢測記錄ID
 * @returns {Promise<Object>} 檢測記錄詳情
 */
export const getDetectionDetails = async (detectionId) => {
  try {
    console.log('📄 請求檢測詳情:', detectionId);

    const response = await authAxios.get(`/api/detection/details/${detectionId}`);

    console.log('✅ 檢測詳情API響應:', response.data);

    // 🔧 修復：確保返回正確的數據結構
    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: response.data.data // 🔑 直接返回 data 對象
      };
    } else {
      throw new Error(response.data.message || '無效的響應格式');
    }

  } catch (error) {
    console.error('❌ 獲取檢測詳情失敗:', error);

    if (error.response?.status === 401) {
      throw new Error('請先登入才能查看檢測詳情');
    } else if (error.response?.status === 404) {
      throw new Error('檢測記錄不存在或您無權訪問');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      '獲取檢測詳情失敗'
    );
  }
};

/**
 * 獲取用戶檢測統計數據
 * @returns {Promise<Object>} 統計數據
 */
export const getUserStats = async () => {
  try {
    console.log('📊 請求用戶統計數據');

    const response = await authAxios.get('/api/detection/stats');

    console.log('✅ 統計數據API響應:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ 獲取統計數據失敗:', error);

    if (error.response?.status === 401) {
      throw new Error('請先登入才能查看統計數據');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      '獲取統計數據失敗'
    );
  }
};

/**
 * 獲取系統統計數據（管理員用）
 * @returns {Promise<Object>} 系統統計數據
 */
export const getSystemStats = async () => {
  try {
    console.log('📊 請求系統統計數據');

    const response = await authAxios.get('/api/detection/system-stats');

    console.log('✅ 系統統計數據API響應:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ 獲取系統統計數據失敗:', error);

    if (error.response?.status === 401) {
      throw new Error('請先登入');
    } else if (error.response?.status === 403) {
      throw new Error('需要管理員權限');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      '獲取系統統計數據失敗'
    );
  }
};

/**
 * 批量匯出檢測結果
 * @param {Array} detectionIds - 檢測記錄ID數組
 * @returns {Promise<Object>}
 */
export const exportBatchDetectionResults = async (detectionIds) => {
  try {
    console.log('📦 開始批量匯出檢測結果:', detectionIds);

    const response = await authAxios.post('/api/detection/export/batch', {
      detectionIds
    }, {
      responseType: 'blob',
      timeout: 120000 // 2分鐘超時，因為批量處理需要更多時間
    });

    // 創建下載鏈接
    const blob = new Blob([response.data], { type: 'application/zip' });
    const downloadUrl = window.URL.createObjectURL(blob);

    // 從響應頭獲取檔案名稱
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `batch_detection_results_${Date.now()}.zip`;
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    }

    // 觸發下載
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理 URL
    window.URL.revokeObjectURL(downloadUrl);

    console.log('✅ 批量匯出成功:', fileName);
    return {
      success: true,
      fileName,
      message: `批量檢測結果已成功匯出！已下載 ${detectionIds.length} 個檢測記錄。`
    };

  } catch (error) {
    console.error('❌ 批量匯出失敗:', error);

    if (error.response?.status === 404) {
      return {
        success: false,
        message: '批量匯出功能暫未實作，請聯繫開發團隊。'
      };
    }

    return {
      success: false,
      message: error.response?.data?.message || '批量匯出失敗，請稍後再試'
    };
  }
};

/**
 * 批量刪除檢測記錄
 * @param {Array} detectionIds - 檢測記錄ID數組
 * @returns {Promise<Object>}
 */
export const batchDeleteDetectionRecords = async (detectionIds) => {
  try {
    console.log('🗑️ 開始批量刪除檢測記錄:', detectionIds);

    const response = await authAxios.delete('/api/detection/batch', {
      data: { detectionIds },
      timeout: 30000
    });

    console.log('✅ 批量刪除API響應:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ 批量刪除失敗:', error);

    if (error.response?.status === 401) {
      throw new Error('請先登入才能刪除記錄');
    } else if (error.response?.status === 403) {
      throw new Error('您沒有權限刪除這些記錄');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      '批量刪除失敗'
    );
  }
};

/**
 * 刪除單個檢測記錄
 * @param {string} detectionId - 檢測記錄ID
 * @returns {Promise<Object>}
 */
export const deleteDetectionRecord = async (detectionId) => {
  try {
    console.log('🗑️ 刪除單個檢測記錄:', detectionId);

    const response = await authAxios.delete(`/api/detection/${detectionId}`);

    console.log('✅ 刪除API響應:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ 刪除失敗:', error);

    if (error.response?.status === 401) {
      throw new Error('請先登入才能刪除記錄');
    } else if (error.response?.status === 403) {
      throw new Error('您沒有權限刪除此記錄');
    } else if (error.response?.status === 404) {
      throw new Error('檢測記錄不存在');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      '刪除記錄失敗'
    );
  }
};

/**
 * 獲取可用的瑕疵類型列表
 * @returns {Promise<Object>} 瑕疵類型列表
 */
export const getAvailableDefectTypes = async () => {
  try {
    console.log('📋 請求可用瑕疵類型列表');

    const response = await authAxios.get('/api/detection/defect-types');

    console.log('✅ 瑕疵類型列表API響應:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ 獲取瑕疵類型列表失敗:', error);

    if (error.response?.status === 401) {
      throw new Error('請先登入才能查看瑕疵類型');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      '獲取瑕疵類型列表失敗'
    );
  }
};

/**
 * 獲取搜尋建議
 * @param {string} query - 搜尋關鍵字
 * @param {string} type - 建議類型 ('all', 'id', 'date')
 * @returns {Promise<Object>} 搜尋建議列表
 */
export const getSearchSuggestions = async (query, type = 'all') => {
  try {
    if (!query || query.length < 2) {
      return { success: true, data: { suggestions: [] } };
    }

    console.log('🔍 請求搜尋建議:', { query, type });

    const params = new URLSearchParams({
      query: query.trim(),
      type
    });

    const response = await authAxios.get(`/api/detection/search/suggestions?${params}`);

    console.log('✅ 搜尋建議API響應:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ 獲取搜尋建議失敗:', error);

    // 搜尋建議失敗不應該影響主要功能，返回空建議
    return { success: true, data: { suggestions: [] } };
  }
};

/**
 * 🆕 獲取最近的檢測記錄 - 供 Home 頁面使用
 * @param {Object} options - 選項
 * @param {number} options.limit - 限制數量，預設5條
 * @returns {Promise<Object>} 最近檢測記錄
 */
export const getRecentDetections = async (options = {}) => {
  try {
    const { limit = 5 } = options;

    console.log('📋 請求最近檢測記錄:', { limit });

    const params = new URLSearchParams({
      limit: limit.toString()
    });

    const response = await authAxios.get(`/api/detection/recent?${params}`);

    console.log('✅ 最近檢測記錄API響應:', response.data);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || '獲取最近檢測記錄失敗');
    }

  } catch (error) {
    console.error('❌ 獲取最近檢測記錄失敗:', error);

    // 🔧 對於最近記錄，即使失敗也要返回可用的數據結構
    return {
      success: false,
      message: error.response?.data?.message || error.message || '獲取最近檢測記錄失敗',
      data: {
        recentDetections: [],
        total: 0,
        hasMore: false,
        isUserSpecific: false
      }
    };
  }
};
