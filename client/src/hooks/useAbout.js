import { useState, useEffect } from 'react';
import { getAllAboutData } from '../services/aboutService';

export default function useAbout() {
  const [aboutData, setAboutData] = useState({
    teamMembers: { teamMembers: [] },
    missionVision: { mission: {}, vision: {}, values: [] },
    techStack: { sections: [] },
    projectTimeline: { milestones: [] },
    contactInfo: { company: {}, socialMedia: [], officeHours: '', supportEmail: '' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAboutData() {
      try {
        setLoading(true);
        const data = await getAllAboutData();
        if (isMounted) {
          setAboutData(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error in useAbout hook:', err);
          setError(err.response?.data?.message || '獲取關於頁面數據失敗，請刷新重試');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAboutData();
    return () => { isMounted = false; };
  }, []);

  return {
    ...aboutData,
    loading,
    error
  };
}
