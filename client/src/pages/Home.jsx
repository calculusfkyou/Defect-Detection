import { motion } from 'framer-motion';
import { useState } from 'react';

// 布局元件
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';

// 功能元件
import WelcomeHero from '../components/features/WelcomeHero';
import AuthStatusBanner from '../components/features/AuthStatusBanner';
import RecentDetectionsList from '../components/features/RecentDetectionsList';
import DashboardStats from '../components/features/DashboardStats';
import LatestAnnouncements from '../components/features/LatestAnnouncements';
import QuickStartGuide from '../components/features/QuickStartGuide';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <WelcomeHero />
      <AuthStatusBanner isAuthenticated={isAuthenticated} />

      <Container className="py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 整合的快速開始與入門指南 */}
          <QuickStartGuide isAuthenticated={isAuthenticated} />

          {/* 統計儀表板 */}
          <DashboardStats />

          {/* 最新公告 */}
          <LatestAnnouncements />

          {/* 根據登入狀態顯示最近檢測 */}
          {isAuthenticated && <RecentDetectionsList />}
        </motion.div>
      </Container>

      <Footer />
    </div>
  );
}
