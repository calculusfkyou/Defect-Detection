import Badge from '../../../components/ui/Badge';
import AnnouncementIcon from '../AnnouncementIcon';
import { ClockIcon, UserIcon } from '@heroicons/react/outline';
import { formatDate } from '../../../utils/dateUtils';

export default function AnnouncementHeader({ announcement }) {
  if (!announcement) return null;

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-start">
        <div className="p-3 bg-gray-100 rounded-lg mr-4 flex-shrink-0">
          <AnnouncementIcon type={announcement.iconType} size="lg" />
        </div>
        <div className="flex-grow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {announcement.title}
            {announcement.important && (
              <Badge variant="danger" className="ml-2">重要</Badge>
            )}
          </h1>
          <p className="text-gray-600 text-lg">{announcement.summary}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-1" />
              <span>{formatDate(announcement.date)}</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 mr-1" />
              <span>{announcement.author}</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {announcement.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
