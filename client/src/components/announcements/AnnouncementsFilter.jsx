import { motion } from 'framer-motion';

export default function AnnouncementsFilter({
  showFilters,
  availableTags,
  selectedTags,
  showImportantOnly,
  onTagToggle,
  onImportantToggle
}) {
  return (
    <div className="relative w-full">
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: showFilters ? 1 : 0,
          height: showFilters ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200 overflow-hidden"
      >
        <h3 className="font-medium text-gray-800 mb-3">標籤篩選</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {availableTags.map(tag => (
            <button
              key={tag.value}
              onClick={() => onTagToggle(tag.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTags.includes(tag.value)
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
              checked={showImportantOnly}
              onChange={onImportantToggle}
            />
            <span className="ml-2 text-sm text-gray-700">僅顯示重要公告</span>
          </label>
        </div>
      </motion.div>
    </div>
  );
}
