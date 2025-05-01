import { XIcon, RefreshIcon, FilterIcon } from '@heroicons/react/outline';

export default function FilterToolbar({
  showFilters,
  setShowFilters,
  hasActiveFilters,
  filteredCount,
  selectedTags,
  showImportantOnly,
  onClearFilters,
  onRefresh
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">所有公告</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-1.5 text-sm rounded border ${
              showFilters || selectedTags.length > 0 || showImportantOnly
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FilterIcon className="h-4 w-4 mr-1.5" />
            篩選條件
            {(selectedTags.length > 0 || showImportantOnly) && (
              <span className="ml-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {selectedTags.length + (showImportantOnly ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={`flex justify-between items-center ${showFilters ? 'mb-4' : 'mb-1'}`}>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <>
              <p className="text-sm text-gray-600">
                共找到 {filteredCount} 條公告
              </p>
              <button
                onClick={onClearFilters}
                className="text-sm text-gray-500 hover:text-red-500 flex items-center ml-3"
              >
                <XIcon className="w-4 h-4 mr-1" />
                清除篩選
              </button>
            </>
          )}
        </div>
        <div>
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <RefreshIcon className="w-4 h-4 mr-1" />
            重新整理
          </button>
        </div>
      </div>
    </>
  );
}
