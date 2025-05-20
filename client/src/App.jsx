// pages
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AnnouncementsPage from './pages/api/AnnouncementsPage';
import AnnouncementDetailPage from './pages/api/AnnouncementDetailPage';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// 組件
import PrivateRoute from './components/auth/PrivateRoute';

// 上下文提供者
import AuthProvider from './components/contexts/AuthContext';

// utils
import ScrollToTop from './utils/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="App">
          <Routes>
            {/* 公開路由 */}
            <Route path="/" element={<Home />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/help/:categoryId" element={<HelpPage />} />
            <Route path="/help/:categoryId/:articleId" element={<HelpPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* 認證路由 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 受保護路由 - 所有登入用戶可訪問 */}
            <Route element={<PrivateRoute />}>
              {/* 在這裡添加需要登入才能訪問的路由 */}
            </Route>

            {/* 受保護路由 - 只有管理員可訪問 */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              {/* 在這裡添加只有管理員可以訪問的路由 */}
            </Route>

            {/* 404 頁面 */}
            <Route path="*" element={<p className="p-6 text-center">找不到頁面 😢</p>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
