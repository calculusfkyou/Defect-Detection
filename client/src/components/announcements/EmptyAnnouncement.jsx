import { motion } from 'framer-motion';

export default function EmptyAnnouncement({ searchQuery, onClearFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-gray-300 w-full">
        <div className="flex items-center justify-center flex-col py-12">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">沒有搜尋結果</h3>
          <p className="text-gray-600 text-center max-w-md mb-6">
            {searchQuery ? (
              <>找不到符合「{searchQuery}」的公告，請嘗試其他關鍵字</>
            ) : (
              <>沒有符合目前篩選條件的公告</>
            )}
          </p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            顯示所有公告
          </button>
        </div>
      </div>
    </motion.div>
  );
}
