import express from 'express';
import multer from 'multer';
import { protect, restrictTo, optionalAuth } from '../middlewares/authMiddleware.js';
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

// 公開的系統統計端點 - 供 Home 頁面使用
router.get('/system-stats', detectionController.getSystemStats);
router.get('/recent', optionalAuth, detectionController.getRecentDetections);  // 🆕 最近檢測記錄

// 搜尋相關路由
router.get('/defect-types', protect, detectionController.getAvailableDefectTypes);
router.get('/search/suggestions', protect, detectionController.getSearchSuggestions);

// 公開路由 - 訪客也可以使用
router.post('/', optionalAuth, upload.single('image'), detectionController.detectDefects);
router.post('/export', detectionController.exportDetectionResult);
router.get('/export/:id', optionalAuth, detectionController.exportHistoryDetectionResult);

// 受保護路由 - 需要登入
router.get('/history', protect, detectionController.getUserDetectionHistory);
router.get('/stats', protect, detectionController.getUserDetectionStats);
router.get('/details/:id', protect, detectionController.getDetectionDetails);
router.delete('/batch', protect, detectionController.batchDeleteDetectionRecords);
router.delete('/:id', protect, detectionController.deleteDetectionRecord);
router.post('/export/batch', protect, detectionController.exportBatchDetectionResults);

// 管理員路由 - 只有管理員可以訪問
router.post(
  '/model/upload',
  protect,
  restrictTo('admin'),
  modelUpload.single('modelFile'),
  detectionController.uploadModel
);
router.get('/system-stats', protect, restrictTo('admin'), detectionController.getSystemStats);

export default router;
