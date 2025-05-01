import { motion } from 'framer-motion';
import { DocumentTextIcon } from '@heroicons/react/outline';

export default function HelpCategory({ category, onArticleSelect }) {
  if (!category) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{category.title}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">相關文章</h2>

        <ul className="space-y-4">
          {category.articles && category.articles.map(article => (
            <motion.li
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => onArticleSelect(article.id)}
                className="w-full text-left p-4 flex items-start rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-blue-600">{article.title}</h3>
                  {article.excerpt && (
                    <p className="mt-1 text-gray-600">{article.excerpt}</p>
                  )}
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
