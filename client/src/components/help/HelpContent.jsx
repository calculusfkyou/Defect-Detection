import { motion } from 'framer-motion';
import Spinner from '../ui/Spinner';
import HelpArticle from './HelpArticle';
import RelatedArticles from './RelatedArticles';
import HelpCategory from './HelpCategory';

export default function HelpContent({
  category,
  article,
  searchResults,
  searchQuery,
  relatedArticles,
  loading,
  error,
  onArticleSelect
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center min-h-[500px] w-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center min-h-[500px] w-full">
        <h2 className="text-xl font-bold text-red-700 mb-4">載入失敗</h2>
        <p className="text-red-600 mb-6">{error}</p>
      </div>
    );
  }

  // 顯示搜尋結果
  if (searchQuery && searchResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm w-full min-h-[500px]"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">搜尋結果: {searchQuery}</h2>
          <p className="text-gray-600 mt-1">找到 {searchResults.length} 筆結果</p>
        </div>

        <div className="p-6">
          {searchResults.length === 0 ? (
            <div className="text-center p-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">找不到相關結果</h3>
              <p className="mt-2 text-gray-500">
                找不到與 "{searchQuery}" 相符的內容，請嘗試其他關鍵字或瀏覽目錄。
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {searchResults.map(result => (
                <li key={result.id} className="py-4">
                  <button
                    onClick={() => onArticleSelect(result.id)}
                    className="block w-full text-left hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <h3 className="text-lg font-medium text-blue-600">{result.title}</h3>
                    <p className="text-gray-600 mt-1 line-clamp-2">{result.excerpt}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">
                        {result.category}
                      </span>
                      {result.tags && result.tags.map(tag => (
                        <span key={tag} className="ml-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    );
  }

  // 顯示系統概述獨立頁面
  if (category && category.standalone && article) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <HelpArticle article={article} />
      </motion.div>
    );
  }

  // 顯示特定文章
  if (article) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <HelpArticle article={article} />

        {/* 相關文章 */}
        {relatedArticles && relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8 w-full"
          >
            <RelatedArticles
              articles={relatedArticles}
              onArticleSelect={onArticleSelect}
            />
          </motion.div>
        )}
      </motion.div>
    );
  }

  // 顯示分類概覽
  if (category) {
    return <HelpCategory category={category} onArticleSelect={onArticleSelect} />;
  }

  // 預設內容
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center min-h-[500px] w-full">
      <h2 className="text-xl font-medium text-gray-700">請從左側選擇一個主題或文章</h2>
    </div>
  );
}
