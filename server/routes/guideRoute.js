import express from 'express';
import * as guideController from '../controllers/guideController.js';

const router = express.Router();
router.get('/', guideController.getGuides);
router.get('/help/categories', guideController.getHelpCategories);
router.get('/help/categories/:categoryId', guideController.getCategoryArticles);
router.get('/help/articles/:articleId', guideController.getArticle);
router.get('/help/search', guideController.searchHelpContent);

export default router;
