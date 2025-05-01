import { useState, useEffect, useCallback } from 'react';
import { announcementService } from '../components/services/announcementService';

export default function useAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 應用篩選條件
  const applyFilters = useCallback((query, tags, importantOnly) => {
    if (!query.trim() && tags.length === 0 && !importantOnly) {
      setFilteredAnnouncements(announcements);
      return;
    }

    let filtered = [...announcements];

    // 應用搜尋查詢
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (announcement) => {
          return (
            announcement.title.toLowerCase().includes(lowerQuery) ||
            announcement.summary.toLowerCase().includes(lowerQuery) ||
            announcement.author?.toLowerCase().includes(lowerQuery) ||
            announcement.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        }
      );
    }

    // 應用標籤篩選
    if (tags.length > 0) {
      filtered = filtered.filter(
        (announcement) => tags.some(tag => announcement.tags.includes(tag))
      );
    }

    // 應用重要性篩選
    if (importantOnly) {
      filtered = filtered.filter(announcement => announcement.important);
    }

    setFilteredAnnouncements(filtered);
  }, [announcements]);

  // 獲取公告列表
  const fetchAnnouncements = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await announcementService.getAnnouncements(page);
      setAnnouncements(data.announcements);
      setFilteredAnnouncements(data.announcements);
      setPagination(data.pagination);

      if (searchQuery.trim() || selectedTags.length > 0 || showImportantOnly) {
        applyFilters(searchQuery, selectedTags, showImportantOnly);
      }
    } catch (err) {
      setError('無法載入公告，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTags, showImportantOnly, applyFilters]);

  // 處理搜尋
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    applyFilters(query, selectedTags, showImportantOnly);
  }, [selectedTags, showImportantOnly, applyFilters]);

  // 處理標籤篩選
  const handleTagToggle = useCallback((tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(updatedTags);
    applyFilters(searchQuery, updatedTags, showImportantOnly);
  }, [searchQuery, selectedTags, showImportantOnly, applyFilters]);

  // 處理重要性篩選
  const handleImportantToggle = useCallback(() => {
    const newValue = !showImportantOnly;
    setShowImportantOnly(newValue);
    applyFilters(searchQuery, selectedTags, newValue);
  }, [searchQuery, selectedTags, showImportantOnly, applyFilters]);

  // 清除所有篩選條件
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setShowImportantOnly(false);
    setFilteredAnnouncements(announcements);
  }, [announcements]);

  // 首次載入時獲取資料
  useEffect(() => {
    fetchAnnouncements(1);
  }, []);

  return {
    announcements,
    filteredAnnouncements,
    searchQuery,
    selectedTags,
    showImportantOnly,
    pagination,
    loading,
    error,
    hasActiveFilters: searchQuery.trim() || selectedTags.length > 0 || showImportantOnly,
    handleSearch,
    handleTagToggle,
    handleImportantToggle,
    handlePageChange: fetchAnnouncements,
    clearAllFilters,
    refreshData: () => fetchAnnouncements(pagination.currentPage)
  };
}
