import multer from 'multer';

// 配置記憶體儲存
const storage = multer.memoryStorage();

/**
 * 通用圖片上傳中介軟體
 */
const createImageUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 預設5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    fieldName = 'image'
  } = options;

  return multer({
    storage,
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (req, file, cb) => {
      // 檢查文件類型
      if (!allowedTypes.includes(file.mimetype)) {
        const allowedExtensions = allowedTypes.map(type =>
          type.split('/')[1].toUpperCase()
        ).join(', ');

        return cb(
          new Error(`只允許上傳 ${allowedExtensions} 格式的圖片`),
          false
        );
      }

      // 檢查文件大小
      if (file.size > maxSize) {
        return cb(
          new Error(`圖片大小不能超過 ${Math.round(maxSize / 1024 / 1024)}MB`),
          false
        );
      }

      cb(null, true);
    }
  });
};

/**
 * 頭像上傳中介軟體
 */
export const avatarUpload = createImageUpload({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  fieldName: 'avatar'
}).single('avatar');

/**
 * 檢測圖片上傳中介軟體
 */
export const detectionImageUpload = createImageUpload({
  maxSize: 15 * 1024 * 1024, // 15MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp'],
  fieldName: 'image'
}).single('image');

/**
 * 模型文件上傳中介軟體
 */
export const modelUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.onnx')) {
      return cb(new Error('只允許上傳ONNX模型文件'), false);
    }
    cb(null, true);
  }
}).single('modelFile');

/**
 * 錯誤處理中介軟體
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超過限制'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: '未預期的文件欄位'
      });
    }
  }

  if (error.message.includes('只允許上傳')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

export default {
  avatarUpload,
  detectionImageUpload,
  modelUpload,
  handleUploadError
};
