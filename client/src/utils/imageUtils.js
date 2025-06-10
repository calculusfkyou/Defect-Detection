/**
 * 壓縮圖像以減少檔案大小
 * @param {File|Blob} imageFile - 要壓縮的圖像檔案
 * @param {Object} options - 壓縮選項
 * @param {number} options.maxWidth - 最大寬度
 * @param {number} options.maxHeight - 最大高度
 * @param {number} options.quality - 壓縮質量 (0-1)
 * @returns {Promise<Blob>} 壓縮後的圖像Blob
 */
export const compressImage = (imageFile, options = {}) => {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    // 創建FileReader讀取文件
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);

    reader.onload = (event) => {
      // 創建圖像對象
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        // 計算新的尺寸
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // 創建Canvas並繪製縮放後的圖像
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為Blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('圖像壓縮失敗'));
          }
        }, imageFile.type, quality);
      };

      img.onerror = () => {
        reject(new Error('無法載入圖像'));
      };
    };

    reader.onerror = () => {
      reject(new Error('無法讀取檔案'));
    };
  });
};

/**
 * 從文件或Blob創建一個對象URL
 * @param {File|Blob} file - 圖像檔案
 * @returns {string} 對象URL
 */
export const createObjectURL = (file) => {
  if (!file) return '';
  return URL.createObjectURL(file);
};

/**
 * 釋放對象URL以避免內存洩漏
 * @param {string} url - 對象URL
 */
export const revokeObjectURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * 獲取圖像的尺寸
 * @param {string} src - 圖像URL或Base64字串
 * @returns {Promise<{width: number, height: number}>} 圖像尺寸
 */
export const getImageDimensions = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('無法載入圖像'));
    };
    img.src = src;
  });
};

/**
 * 檢查檔案是否為有效的圖像類型
 * @param {File} file - 要檢查的檔案
 * @returns {boolean} 如果是有效的圖像檔案則返回true
 */
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'];
  return file && validTypes.includes(file.type);
};

/**
 * 檢查圖像檔案大小是否在限制範圍內
 * @param {File} file - 要檢查的檔案
 * @param {number} maxSizeMB - 最大檔案大小 (MB)
 * @returns {boolean} 如果檔案大小在限制範圍內則返回true
 */
export const isFileSizeValid = (file, maxSizeMB = 10) => {
  return file && file.size <= maxSizeMB * 1024 * 1024;
};
