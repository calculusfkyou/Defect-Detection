import { useState, useEffect } from 'react';
import { announcementService } from '../components/services/announcementService';

export default function useAnnouncement(id) {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncementDetail = async () => {
      setLoading(true);
      try {
        const data = await announcementService.getAnnouncementById(id);
        setAnnouncement(data);
      } catch (err) {
        console.error(`Error fetching announcement with id ${id}:`, err);
        setError('無法載入公告詳情，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnnouncementDetail();
    }
  }, [id]);

  return { announcement, loading, error };
}
