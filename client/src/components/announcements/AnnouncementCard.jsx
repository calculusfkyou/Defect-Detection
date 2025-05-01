import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../../components/ui/Badge';
import AnnouncementIcon from './AnnouncementIcon';

export default function AnnouncementCard({ announcement, formatDate }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Link
        to={`/announcements/${announcement.id}`}
        className="block w-full"
      >
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border-l-4 border-blue-500 w-full">
          <div className="flex items-start">
            <div className="p-2 bg-gray-100 rounded-lg mr-4 flex-shrink-0">
              <AnnouncementIcon type={announcement.iconType} />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {announcement.title}
                  {announcement.important && (
                    <Badge variant="danger" className="ml-2">重要</Badge>
                  )}
                </h3>
                <span className="text-sm text-gray-500">{formatDate(announcement.date)}</span>
              </div>
              <p className="text-gray-600">{announcement.summary}</p>
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
      </Link>
    </motion.div>
  );
}
