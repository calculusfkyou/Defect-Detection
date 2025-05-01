import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 圖標
import {
  LightningBoltIcon, CalendarIcon, LightBulbIcon, UserGroupIcon,
  ShieldCheckIcon, ChartBarIcon, HandIcon, BeakerIcon, ClipboardListIcon,
  AcademicCapIcon, RefreshIcon, DatabaseIcon
} from '@heroicons/react/outline';

// UI元件
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

export default function LatestAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestAnnouncements = async () => {
      try {
        // 只取最新的4條
        const response = await axios.get('/api/announcements?page=1&limit=4');
        setAnnouncements(response.data.announcements);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('無法載入公告');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAnnouncements();
  }, []);

  // 根據圖標類型返回對應的圖標組件
  const getIconByType = (type) => {
    switch (type) {
      case 'warning':
        return <LightningBoltIcon className="h-6 w-6 text-yellow-500" />;
      case 'calendar':
        return <CalendarIcon className="h-6 w-6 text-blue-500" />;
      case 'lightbulb':
        return <LightBulbIcon className="h-6 w-6 text-amber-500" />;
      case 'users':
        return <UserGroupIcon className="h-6 w-6 text-indigo-500" />;
      case 'shield':
        return <ShieldCheckIcon className="h-6 w-6 text-red-500" />;
      case 'chart':
        return <ChartBarIcon className="h-6 w-6 text-green-500" />;
      case 'handshake':
        return <HandIcon className="h-6 w-6 text-purple-500" />;
      case 'medical':
        return <BeakerIcon className="h-6 w-6 text-emerald-500" />;
      case 'survey':
        return <ClipboardListIcon className="h-6 w-6 text-cyan-500" />;
      case 'education':
        return <AcademicCapIcon className="h-6 w-6 text-orange-500" />;
      case 'update':
        return <RefreshIcon className="h-6 w-6 text-blue-600" />;
      case 'database':
        return <DatabaseIcon className="h-6 w-6 text-gray-600" />;
      default:
        return <CalendarIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const options = { month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">最新公告</h2>
        <Link to="/announcements" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
          查看全部公告
          <svg className="ml-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <Card className="p-4 bg-red-50 text-red-700">
          <p>{error}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link to={`/announcements/${announcement.id}`} className="block">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <div className="p-5 flex">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3 flex-shrink-0">
                      {getIconByType(announcement.iconType)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 pr-2 truncate">
                          {announcement.title}
                          {announcement.important && (
                            <span className="ml-2">
                              <Badge variant="danger">重要</Badge>
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500">{formatDate(announcement.date)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{announcement.summary}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
