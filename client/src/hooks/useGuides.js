import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useGuides() {
  const [data, setData] = useState({
    features: [],
    guides: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await axios.get('/api/guides');
        setData({
          features: response.data.features || [],
          guides: response.data.guides || [],
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching guides:', err);
        setData({
          features: [],
          guides: [],
          loading: false,
          error: err.message || '無法載入指南'
        });
      }
    };

    fetchGuides();
  }, []);

  return data;
}
