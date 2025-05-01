import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];

  // 確定要顯示哪些頁碼
  if (totalPages <= 7) {
    // 少於等於7頁時，顯示所有頁碼
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 超過7頁時，採用省略形式
    if (currentPage <= 3) {
      // 當前頁在前面
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // 當前頁在後面
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 當前頁在中間
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }
  }

  return (
    <nav className="flex justify-center">
      <ul className="flex items-center space-x-1">
        {/* 上一頁按鈕 */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
            <span className="sr-only">上一頁</span>
          </button>
        </li>

        {/* 頁碼 */}
        {pages.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* 下一頁按鈕 */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronRightIcon className="h-5 w-5" />
            <span className="sr-only">下一頁</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
