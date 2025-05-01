import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/outline';
import { formatDate } from '../../utils/dateUtils';
import HelpVideo from './HelpVideo';
import FAQAccordion from './FAQAccordion';
import HelpActionBar from './HelpActionBar';

export default function HelpArticle({ article }) {
  if (!article) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      {/* 文章頭部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <Link
            to={`/help/${article.categoryId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {article.lastUpdated && (
            <div className="flex items-center">
              <span>更新於 {formatDate(article.lastUpdated)}</span>
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 文章內容 */}
      <div className="p-6">
        {/* 摘要 */}
        {article.excerpt && (
          <div className="mb-6 text-lg font-medium text-gray-600 border-l-4 border-blue-500 pl-4 py-2">
            {article.excerpt}
          </div>
        )}

        {/* 視頻教學 (如果有) */}
        {article.videoUrl && (
          <div className="mb-8">
            <HelpVideo url={article.videoUrl} title={article.title} />
          </div>
        )}

        {/* 主要內容 */}
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* 常見問題 */}
        {article.faqs && article.faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">常見問題</h2>
            <FAQAccordion faqs={article.faqs} />
          </div>
        )}
      </div>

      {/* 文章操作列 */}
      <HelpActionBar article={article} />
    </motion.div>
  );
}
