import express from 'express';
import * as announcementController from '../controllers/announcementController.js';

const router = express.Router();
// 獲取公告列表(含分頁)
router.get('/', announcementController.getAnnouncements);

// 獲取單一公告詳情
router.get('/:id', announcementController.getAnnouncementById);

export default router;
