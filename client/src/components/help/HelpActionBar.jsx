import { useState } from 'react';
import { ShareIcon, BookmarkIcon, PrinterIcon, ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/outline';
import { BookmarkIcon as SolidBookmarkIcon } from '@heroicons/react/solid';

export default function HelpActionBar({ article }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(null);

  // 處理分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href,
        });
      } catch (error) {
        console.error('分享失敗:', error);
      }
    } else {
      // 複製連結到剪貼簿
      navigator.clipboard.writeText(window.location.href);
      alert('連結已複製到剪貼簿');
    }
  };

  // 處理列印功能
  const handlePrint = () => {
    window.print();
  };

  // 處理收藏功能
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // 在實際應用中可以將收藏狀態存儲到服務器或本地存儲
  };

  // 處理反饋
  const handleFeedback = (isHelpful) => {
    setFeedbackSubmitted(isHelpful);
    // 在實際應用中可以將反饋發送到服務器
  };

  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center">
      <div className="flex items-center space-x-2 mb-4 sm:mb-0">
        {feedbackSubmitted === null ? (
          <>
            <span className="text-sm text-gray-600 mr-2">此文章對您有幫助嗎？</span>
            <button
              onClick={() => handleFeedback(true)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ThumbUpIcon className="h-4 w-4 mr-2" />
              有幫助
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ThumbDownIcon className="h-4 w-4 mr-2" />
              沒幫助
            </button>
          </>
        ) : (
          <div className="text-sm text-gray-600">
            感謝您的反饋！
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={handleShare}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="分享"
          title="分享"
        >
          <ShareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handlePrint}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="列印"
          title="列印"
        >
          <PrinterIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleBookmark}
          className={`p-2 ${isBookmarked ? 'text-blue-600' : 'text-gray-600'} hover:bg-gray-200 rounded-full transition-colors`}
          aria-label={isBookmarked ? "取消收藏" : "收藏"}
          title={isBookmarked ? "取消收藏" : "收藏"}
        >
          {isBookmarked ? (
            <SolidBookmarkIcon className="h-5 w-5" />
          ) : (
            <BookmarkIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
