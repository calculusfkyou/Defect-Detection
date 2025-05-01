import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/outline';

export default function AnnouncementNavigation() {
  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <Link
        to="/announcements"
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
        onClick={() => window.scrollTo(0, 0)} // 確保回到列表頁時滾動到頂部
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        返回公告列表
      </Link>
    </div>
  );
}
