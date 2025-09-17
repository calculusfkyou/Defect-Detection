import express from 'express';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';
import { avatarUpload, handleUploadError } from '../middlewares/uploadMiddleware.js';
import * as profileController from '../controllers/profileController.js';

const router = express.Router();

// 🔧 公開路由：獲取用戶頭像（放在 protect 中介軟體之前）
router.get('/avatar/:userId', optionalAuth, profileController.getAvatar);

// 🔧 所有其他路由都需要登入認證
router.use(protect);

// 個人資料相關路由
router.get('/', profileController.getUserProfile);
router.put('/', profileController.updateUserProfile);
router.put('/password', profileController.changePassword);
router.get('/activity', profileController.getUserActivityLog);
router.delete('/', profileController.deleteUserAccount);

// 頭像相關路由
router.post('/avatar', avatarUpload, handleUploadError, profileController.uploadAvatar);

export default router;
