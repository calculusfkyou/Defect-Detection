import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // 監聽滾動事件，用於控制導覽列顯示/隱藏
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 判斷是否已滾動超過導覽列高度
      const isScrolled = currentScrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }

      // 判斷滾動方向
      if (currentScrollY < lastScrollY.current || currentScrollY <= 0) {
        // 向上滾動或在頁面頂部，顯示導覽列
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // 向下滾動且已經滾動一定距離，隱藏導覽列
        // 只有滾動超過100px才會隱藏，避免輕微滾動就觸發
        setVisible(false);
      }

      // 保存當前滾動位置
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navigate = useNavigate();

  // 處理公告導航
  const handleAnnouncementClick = (e) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'instant' // 使用 instant 而非 smooth 以避免視覺延遲
    });

    // 導航到公告頁面的第一頁
    navigate('/announcements');

    // 如果已經在公告頁面，則手動重置頁面狀態
    if (window.location.pathname === '/announcements') {
      window.location.reload(); // 重置頁面狀態，回到第一頁
    }
  };

  const handleAboutClick = (e) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });

    navigate('/about');

    // 如果已經在關於我們頁面，重新載入頁面狀態
    if (window.location.pathname === '/about') {
      // 如果不想重新載入整個頁面，也可以觸發特定的狀態更新
      // 例如通過 context 或其他狀態管理來重新獲取數據
      window.location.reload();
    }
  };

  return (
    <>
      {/* 空白div用來補償fixed導覽列佔用的空間 */}
      <div className="h-24"></div>

      <motion.nav
        initial={{ opacity: 1, y: 0 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : -100,
        }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-30 bg-gray-900 text-white ${scrolled ? 'shadow-xl' : 'shadow-md'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0"
              >
                <Link to="/" className="flex items-center">
                  <svg className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM8 17H5c-.55 0-1-.45-1-1v-2h4v3zm0-5H4v-2h4v2zm0-4H4V7h4v1zm8 9h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V7h6v1zm3 8h-1v-2h1v2zm0-4h-1v-2h1v2zm0-4h-1V7h1v1z" />
                  </svg>
                  <span className="ml-3 text-2xl font-bold">PCB檢測系統</span>
                </Link>
              </motion.div>
              <div className="hidden md:block ml-12">
                <div className="flex items-baseline space-x-6">
                  <Link to="/" className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800">首頁</Link>
                  <Link to="/detection" className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800">影像檢測</Link>
                  <Link to="/history" className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800">歷史紀錄</Link>
                  <Link to="/announcements" onClick={handleAnnouncementClick} className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800">最新公告</Link>
                  <Link to="/help/about-system" className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800">使用手冊</Link>
                  <Link to="/about" onClick={handleAboutClick} className="px-4 py-3 rounded-md text-base font-medium hover:bg-gray-800">關於我們</Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="flex space-x-3">
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-5 py-2 text-base border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      登入
                    </motion.button>
                  </Link>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-5 py-2 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      註冊
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-gray-800 inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">開啟主選單</span>
                <svg className="block h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">首頁</Link>
              <Link to="/detection" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">影像檢測</Link>
              <Link to="/history" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">歷史紀錄</Link>
              <Link to="/announcements" onClick={handleAnnouncementClick} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">最新公告</Link>
              <Link to="/help/about-system" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">使用手冊</Link>
              <Link to="/about" onClick={handleAboutClick} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">關於我們</Link>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex flex-col space-y-2 px-5">
                <Link to="/login" className="w-full">
                  <button className="w-full px-4 py-2 text-sm border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors">
                    登入
                  </button>
                </Link>
                <Link to="/register" className="w-full">
                  <button className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    註冊
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
}
