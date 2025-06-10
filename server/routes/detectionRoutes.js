import express from 'express';
import multer from 'multer';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import * as detectionController from '../controllers/detectionController.js';

const router = express.Router();

// 配置文件上傳 - 存儲在內存中，不寫入磁盤
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB 限制
  },
  fileFilter: (req, file, cb) => {
    // 檢查文件類型
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png|bmp)$/)) {
      return cb(new Error('只允許上傳JPG、PNG或BMP格式的圖片'), false);
    }
    cb(null, true);
  }
});

// 模型文件上傳配置
const modelUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB 限制
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.onnx')) {
      return cb(new Error('只允許上傳ONNX模型文件'), false);
    }
    cb(null, true);
  }
});

// 公開路由 - 訪客也可以使用
router.post('/', upload.single('image'), detectionController.detectDefects);

// 受保護路由 - 需要登入
router.get('/history', protect, detectionController.getUserDetectionHistory);
router.get('/details/:id', protect, detectionController.getDetectionDetails);

// 管理員路由 - 只有管理員可以訪問
router.post(
  '/model/upload',
  protect,
  restrictTo('admin'),
  modelUpload.single('modelFile'),
  detectionController.uploadModel
);

export default router;
