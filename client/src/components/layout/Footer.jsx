import { Link } from 'react-router-dom';
// 需安裝: npm install react-icons
import { FaFacebook, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  // 網站主要連結
  const mainLinks = [
    { name: "影像檢測", href: "/detection" },
    { name: "檢測歷史", href: "/history" },
    { name: "生成報告", href: "/reports" },
    { name: "最新公告", href: "/announcements" },
    { name: "使用手冊", href: "/help/about-system" },
    { name: "關於我們", href: "/about" },
  ];

  // 法律相關連結
  const legalLinks = [
    { name: "隱私政策", href: "/privacy" },
    { name: "使用條款", href: "/terms" },
    { name: "聯絡我們", href: "/contact" },
  ];

  // 社群媒體連結
  const socialLinks = [
    { name: "Facebook", icon: <FaFacebook size={18} />, href: "https://facebook.com" },
    { name: "LinkedIn", icon: <FaLinkedin size={18} />, href: "https://linkedin.com" },
    { name: "GitHub", icon: <FaGithub size={18} />, href: "https://github.com" },
    { name: "Email", icon: <FaEnvelope size={18} />, href: "mailto:contact@pcb-detection.com" },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* 三欄布局：Logo、連結、社群 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
          {/* 欄位 1: Logo 與簡介 */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center mb-4">
              <svg className="h-10 w-10 text-blue-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM8 17H5c-.55 0-1-.45-1-1v-2h4v3zm0-5H4v-2h4v2zm0-4H4V7h4v1zm8 9h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V7h6v1zm3 8h-1v-2h1v2zm0-4h-1v-2h1v2zm0-4h-1V7h1v1z" />
              </svg>
              <span className="text-xl font-bold">PCB檢測系統</span>
            </div>
            <p className="text-gray-400 text-sm text-center md:text-left">
              高效率、高準確度的PCB瑕疵檢測解決方案，為您的產品品質把關
            </p>
          </div>

          {/* 欄位 2: 主要連結 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">功能導航</h3>
            <div className="grid grid-cols-2 gap-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 欄位 3: 社群連結 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">關注我們</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 分隔線 */}
        <div className="border-t border-gray-800 pt-8">
          {/* 法律相關連結與版權信息 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6 mb-4 md:mb-0">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <p className="text-center md:text-right text-sm text-gray-400">
              &copy; {new Date().getFullYear()} PCB Defect Detection System Co.,Ltd. ALL RIGHTS RESERVED. Designed by Charlie Wu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
