import { useState, useEffect, useCallback } from 'react';
import helpService from '../services/helpService';

export default function useHelpContent(categoryId, articleId, initialSearchQuery = '') {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 搜尋函數
  const searchHelpContent = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await helpService.searchHelp(query);
      setSearchResults(data.results || []);
      setError(null);
    } catch (err) {
      console.error(`Error searching help content:`, err);
      setError('搜尋過程中發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 處理初始搜尋
  useEffect(() => {
    if (!initialSearchQuery || initialSearchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    searchHelpContent(initialSearchQuery);
  }, [initialSearchQuery, searchHelpContent]);

  // 優化：移除重複的 useEffect，確保代碼更加清晰
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 獲取所有分類
        const categoryData = await helpService.getCategories();
        setCategories(categoryData.categories || []);

        // 如果選擇了分類
        if (categoryId) {
          // 檢查是否為獨立目錄
          const selectedCategory = categoryData.categories.find(c => c.id === categoryId);

          if (selectedCategory && selectedCategory.standalone) {
            // 如果是獨立目錄，直接獲取文章內容
            const articleData = await helpService.getArticle(categoryId);
            setCurrentArticle(articleData.article || null);
            setRelatedArticles(articleData.relatedArticles || []);
            setArticles([]); // 清空文章列表
          } else {
            // 常規分類，獲取該分類下的文章列表
            const articlesData = await helpService.getCategoryArticles(categoryId);
            setArticles(articlesData.articles || []);

            // 如果還選擇了特定文章
            if (articleId) {
              const articleData = await helpService.getArticle(articleId);
              setCurrentArticle(articleData.article || null);
              setRelatedArticles(articleData.relatedArticles || []);
            } else {
              setCurrentArticle(null);
              setRelatedArticles([]);
            }
          }
        } else {
          // 沒有選擇分類，清空相關狀態
          setArticles([]);
          setCurrentArticle(null);
          setRelatedArticles([]);
        }
      } catch (err) {
        console.error('Error fetching help content:', err);
        setError('無法載入幫助內容，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, articleId]);

  return {
    categories,
    articles,
    currentArticle,
    relatedArticles,
    loading,
    error,
    searchResults,
    searchHelpContent
  };
}
