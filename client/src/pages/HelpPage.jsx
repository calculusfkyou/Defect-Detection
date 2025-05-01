import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

// 布局元件
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
// 不再使用這個受限的 Container 元件
// import Container from '../components/layout/Container';
import PageHeader from '../components/layout/PageHeader';

// UI 元件
import SearchBar from '../components/ui/SearchBar';
import Spinner from '../components/ui/Spinner';

// 使用手冊元件
import HelpNavigation from '../components/help/HelpNavigation';
import HelpContent from '../components/help/HelpContent';

// 自定義 Hook
import useHelpContent from '../hooks/useHelpContent';

export default function HelpPage() {
  const { categoryId, articleId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'getting-started');
  const [selectedArticle, setSelectedArticle] = useState(articleId || null);

  const {
    categories,
    articles,
    currentArticle,
    relatedArticles,
    loading,
    error,
    searchResults,
    searchHelpContent
  } = useHelpContent(selectedCategory, selectedArticle, searchQuery);

  // 處理分類變更
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedArticle(null);
    navigate(`/help/${categoryId}`);
  };

  // 處理文章選擇
  const handleArticleSelect = (articleId) => {
    setSelectedArticle(articleId);
    navigate(`/help/${selectedCategory}/${articleId}`);
    // 滾動到頁面頂部 (透過 ScrollToTop 元件處理)
  };

  // 處理搜尋
  const handleSearch = (query) => {
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
    searchHelpContent(query);
  };

  // URL 變更時更新狀態
  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);

      // 如果選擇了獨立目錄，自動載入相應的文章
      const selectedCat = categories.find(c => c.id === categoryId);
      if (selectedCat && selectedCat.standalone) {
        setSelectedArticle(categoryId);  // 對於獨立目錄，文章ID與分類ID相同
      } else if (!articleId) {
        setSelectedArticle(null);
      }
    }

    if (articleId) {
      setSelectedArticle(articleId);
    }
  }, [categoryId, articleId, categories]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <PageHeader
        title="使用手冊"
        description="了解如何有效使用PCB瑕疵檢測系統的各項功能"
      />

      {/* 替換為自定義寬度容器 */}
      <div className="w-full max-w-[95%] xl:max-w-[1800px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchQuery}
            placeholder="搜尋使用手冊、教學和常見問題..."
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 側邊導航 - 設為固定寬度 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:w-[260px] flex-shrink-0"
          >
            <HelpNavigation
              categories={categories}
              selectedCategory={selectedCategory}
              selectedArticle={selectedArticle}
              onCategoryChange={handleCategoryChange}
              onArticleSelect={handleArticleSelect}
              loading={loading}
            />
          </motion.div>

          {/* 主要內容 - 使用剩餘空間 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="lg:flex-1"
          >
            <HelpContent
              category={categories.find(c => c.id === selectedCategory)}
              article={currentArticle}
              searchResults={searchResults}
              searchQuery={searchQuery}
              relatedArticles={relatedArticles}
              loading={loading}
              error={error}
              onArticleSelect={handleArticleSelect}
            />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
