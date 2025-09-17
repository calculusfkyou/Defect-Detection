import axios from 'axios';

const helpService = {
  // 獲取所有幫助內容分類
  getCategories: async () => {
    try {
      const response = await axios.get('/api/guides/help/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching help categories:', error);
      throw error;
    }
  },

  // 獲取特定分類下的文章
  getCategoryArticles: async (categoryId) => {
    try {
      const response = await axios.get(`/api/guides/help/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching articles for category ${categoryId}:`, error);
      throw error;
    }
  },

  // 獲取特定文章的詳細內容
  getArticle: async (articleId) => {
    try {
      const response = await axios.get(`/api/guides/help/articles/${articleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching article ${articleId}:`, error);
      throw error;
    }
  },

  // 搜尋幫助內容
  searchHelp: async (query) => {
    try {
      const response = await axios.get(`/api/guides/help/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching help content:`, error);
      throw error;
    }
  }
};

export default helpService;
