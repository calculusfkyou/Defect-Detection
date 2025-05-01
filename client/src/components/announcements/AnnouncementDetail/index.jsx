import { motion } from 'framer-motion';
import AnnouncementHeader from './AnnouncementHeader';
import AnnouncementContent from './AnnouncementContent';
import AnnouncementNavigation from './AnnouncementNavigation';

export default function AnnouncementDetail({ announcement }) {
  if (!announcement) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md rounded-lg overflow-hidden"
    >
      <AnnouncementHeader announcement={announcement} />
      <AnnouncementContent content={announcement.content} />
      <AnnouncementNavigation />
    </motion.div>
  );
}
