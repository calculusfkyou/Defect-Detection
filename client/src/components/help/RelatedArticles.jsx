import { DocumentTextIcon } from '@heroicons/react/outline';

export default function RelatedArticles({ articles, onArticleSelect }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-blue-50 rounded-lg p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">相關文章</h2>
      <ul className="space-y-3">
        {articles.map(article => (
          <li key={article.id}>
            <button
              onClick={() => onArticleSelect(article.id)}
              className="flex items-start p-3 w-full text-left rounded-lg hover:bg-blue-100 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-700">{article.title}</h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
