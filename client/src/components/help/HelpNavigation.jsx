import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, MenuAlt2Icon, InformationCircleIcon } from '@heroicons/react/outline';
import Spinner from '../ui/Spinner';

export default function HelpNavigation({
  categories,
  selectedCategory,
  selectedArticle,
  onCategoryChange,
  onArticleSelect,
  loading
}) {
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleCategory = (categoryId) => {
    setExpandedCategoryId(prev => prev === categoryId ? null : categoryId);
  };

  const isCategoryExpanded = (categoryId) => {
    return categoryId === expandedCategoryId;
  };

  useEffect(() => {
    if (selectedCategory) {
      setExpandedCategoryId(selectedCategory);
    }
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm h-96 flex items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">使用手冊目錄</h2>
        <button
          className="md:hidden p-1 rounded-md hover:bg-gray-100"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          <MenuAlt2Icon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <nav className={`p-2 ${isMobileNavOpen ? 'block' : 'hidden md:block'}`}>
        <ul className="space-y-1">
          {categories.map(category => (
            <li key={category.id} className="mb-2">
              {category.standalone ? (
                // 獨立目錄項（沒有子目錄）
                <button
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex items-center w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center">
                    {category.icon && (
                      <span className="mr-2">{category.icon}</span>
                    )}
                    {category.title}
                  </span>
                </button>
              ) : (
                // 有子目錄的普通分類
                <>
                  <button
                    onClick={() => {
                      toggleCategory(category.id);
                      onCategoryChange(category.id);
                    }}
                    className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center">
                      {category.icon && (
                        <span className="mr-2">{category.icon}</span>
                      )}
                      {category.title}
                    </span>
                    {isCategoryExpanded(category.id) ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>

                  {/* 文章列表 - 加入淡入淡出動畫 */}
                  {isCategoryExpanded(category.id) && category.articles && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 pl-8 space-y-1"
                    >
                      {category.articles.map(article => (
                        <li key={article.id}>
                          <button
                            onClick={() => onArticleSelect(article.id)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                              selectedArticle === article.id
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {article.title}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
