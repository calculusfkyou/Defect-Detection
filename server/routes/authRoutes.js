import express from 'express';
import { register, login, logout, getCurrentUser, getAllUsers } from '../controllers/authController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 公開路由
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// 需要認證的路由
router.get('/me', protect, getCurrentUser);

// 僅限管理員的路由
router.get('/users', protect, restrictTo('admin'), getAllUsers);

export default router;
