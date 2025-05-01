import { useState } from 'react';

// 布局元件
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Container from '../../components/layout/Container';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/ui/SearchBar';

// 公告相關元件
import AnnouncementsFilter from '../../components/announcements/AnnouncementsFilter';
import FilterToolbar from '../../components/announcements/FilterToolbar';
import AnnouncementsList from '../../components/announcements/AnnouncementsList';

// 自定義Hook與常量
import useAnnouncements from '../../hooks/useAnnouncements';
import { ANNOUNCEMENT_TAGS } from '../../components/constants/announcementConstants';
import { formatDate } from '../../utils/dateUtils';

export default function AnnouncementsPage() {
  const [showFilters, setShowFilters] = useState(false);

  const {
    filteredAnnouncements,
    searchQuery,
    selectedTags,
    showImportantOnly,
    pagination,
    loading,
    error,
    hasActiveFilters,
    handleSearch,
    handleTagToggle,
    handleImportantToggle,
    handlePageChange,
    clearAllFilters,
    refreshData
  } = useAnnouncements();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <PageHeader title="最新公告" description="了解系統的最新動態、功能更新與重要通知" />

      <Container className="py-8">
        <div className="mb-8">
          {/* 標題與篩選按鈕 */}
          <FilterToolbar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            filteredCount={filteredAnnouncements.length}
            selectedTags={selectedTags}
            showImportantOnly={showImportantOnly}
            onClearFilters={clearAllFilters}
            onRefresh={refreshData}
          />

          {/* 搜尋欄 */}
          <div className="mb-2">
            <SearchBar
              onSearch={handleSearch}
              placeholder="搜尋公告標題、內容、作者或標籤..."
              initialValue={searchQuery}
            />
          </div>

          {/* 篩選面板 */}
          <AnnouncementsFilter
            showFilters={showFilters}
            availableTags={ANNOUNCEMENT_TAGS}
            selectedTags={selectedTags}
            showImportantOnly={showImportantOnly}
            onTagToggle={handleTagToggle}
            onImportantToggle={handleImportantToggle}
          />

          {/* 公告列表 */}
          <AnnouncementsList
            loading={loading}
            error={error}
            announcements={filteredAnnouncements}
            searchQuery={searchQuery}
            hasActiveFilters={hasActiveFilters}
            pagination={pagination}
            onClearFilters={clearAllFilters}
            onPageChange={handlePageChange}
            formatDate={formatDate}
          />
        </div>
      </Container>

      <Footer />
    </div>
  );
}
