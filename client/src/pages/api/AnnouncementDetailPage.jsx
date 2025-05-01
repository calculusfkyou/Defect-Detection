import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/outline';

// 布局元件
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Container from '../../components/layout/Container';
import PageHeader from '../../components/layout/PageHeader';

// UI元件
import Spinner from '../../components/ui/Spinner';

// 自定義組件和Hook
import AnnouncementDetail from '../../components/announcements/AnnouncementDetail';
import useAnnouncement from '../../hooks/useAnnouncement';

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const { announcement, loading, error } = useAnnouncement(id);

  // 處理載入狀態
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <Container className="flex-grow flex justify-center items-center py-16">
          <Spinner size="lg" />
        </Container>
        <Footer />
      </div>
    );
  }

  // 處理錯誤狀態
  if (error || !announcement) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <Container className="flex-grow py-16">
          <div className="bg-red-50 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-red-700 mb-4">載入失敗</h2>
            <p className="text-red-600 mb-6">{error || '找不到此公告'}</p>
            <Link
              to="/announcements"
              className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => window.scrollTo(0, 0)}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              返回公告列表
            </Link>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <PageHeader
        title={announcement.title}
        description={announcement.summary}
      />

      <Container className="py-8">
        <AnnouncementDetail announcement={announcement} />
      </Container>

      <Footer />
    </div>
  );
}
