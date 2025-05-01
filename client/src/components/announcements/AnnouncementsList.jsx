import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import AnnouncementCard from './AnnouncementCard';
import EmptyAnnouncement from './EmptyAnnouncement';

export default function AnnouncementsList({
  loading,
  error,
  announcements,
  searchQuery,
  hasActiveFilters,
  pagination,
  onClearFilters,
  onPageChange,
  formatDate
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.length === 0 ? (
        <EmptyAnnouncement
          searchQuery={searchQuery}
          onClearFilters={onClearFilters}
        />
      ) : (
        announcements.map(announcement => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            formatDate={formatDate}
          />
        ))
      )}

      {!hasActiveFilters && announcements.length > 0 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
