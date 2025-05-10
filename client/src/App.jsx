// pages
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AnnouncementsPage from './pages/api/AnnouncementsPage';
import AnnouncementDetailPage from './pages/api/AnnouncementDetailPage';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage'

// utils
import ScrollToTop from './utils/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/help/:categoryId" element={<HelpPage />} />
          <Route path="/help/:categoryId/:articleId" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<p className="p-6 text-center">找不到頁面 😢</p>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
