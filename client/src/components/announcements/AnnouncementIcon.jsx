import {
  LightningBoltIcon, CalendarIcon, LightBulbIcon, UserGroupIcon,
  ShieldCheckIcon, ChartBarIcon, HandIcon, BeakerIcon, ClipboardListIcon,
  AcademicCapIcon, RefreshIcon, DatabaseIcon
} from '@heroicons/react/outline';

export default function AnnouncementIcon({ type }) {
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
}
