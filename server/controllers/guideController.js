import GuideModel from '../model/guideModel.js';  // 注意路徑是 model 不是 models

export async function getGuides(req, res) {
  try {
    const guides = await GuideModel.getGuides();
    res.status(200).json(guides);
  } catch (error) {
    console.error('Error in getGuides controller:', error);
    res.status(500).json({ message: '獲取指南失敗' });
  }
}

export async function getHelpCategories(req, res) {
  try {
    const categories = await GuideModel.getHelpCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getHelpCategories controller:', error);
    res.status(500).json({ message: '獲取幫助分類失敗' });
  }
}

export async function getCategoryArticles(req, res) {
  try {
    const { categoryId } = req.params;
    const data = await GuideModel.getCategoryArticles(categoryId);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in getCategoryArticles controller for category ${req.params.categoryId}:`, error);
    res.status(500).json({ message: '獲取分類文章失敗' });
  }
}

export async function getArticle(req, res) {
  try {
    const { articleId } = req.params;
    const data = await GuideModel.getArticle(articleId);

    if (!data.article) {
      return res.status(404).json({ message: '找不到該文章' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in getArticle controller for article ${req.params.articleId}:`, error);
    res.status(500).json({ message: '獲取文章失敗' });
  }
}

export async function searchHelpContent(req, res) {
  try {
    const { q } = req.query;
    const data = await GuideModel.searchHelpContent(q);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in searchHelpContent controller:', error);
    res.status(500).json({ message: '搜尋失敗' });
  }
}
