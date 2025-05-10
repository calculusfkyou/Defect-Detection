import express from 'express';
import {
  getTeamMembers,
  getMissionVision,
  getTechStack,
  getProjectTimeline,
  getContactInfo,
  getAllAboutData
} from '../controllers/aboutController.js';

const router = express.Router();

// 獲取團隊成員資訊
router.get('/team', getTeamMembers);

// 獲取使命願景資訊
router.get('/mission-vision', getMissionVision);

// 獲取技術堆疊資訊
router.get('/tech-stack', getTechStack);

// 獲取專案時間線
router.get('/timeline', getProjectTimeline);

// 獲取聯絡資訊
router.get('/contact', getContactInfo);

// 一次性獲取所有關於頁面資料
router.get('/', getAllAboutData);

export default router;
