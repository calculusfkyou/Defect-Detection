import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useStats() {
  const [data, setData] = useState({
    stats: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setData({
          stats: response.data,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setData({
          stats: null,
          loading: false,
          error: err.message || '無法載入統計數據'
        });
      }
    };

    fetchStats();
  }, []);

  return data;
}
