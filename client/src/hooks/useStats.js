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
        setData(prev => ({ ...prev, loading: true, error: null }));

        console.log('📊 獲取全系統統計數據...');

        // 使用新的系統統計端點
        const response = await axios.get('/api/detection/system-stats');

        if (response.data.success && response.data.data) {
          console.log('✅ 系統統計數據獲取成功:', response.data.data);

          setData({
            stats: response.data.data,
            loading: false,
            error: null
          });
        } else {
          throw new Error(response.data.message || '獲取統計數據失敗');
        }
      } catch (err) {
        console.error('❌ 獲取統計數據失敗:', err);
        setData({
          stats: null,
          loading: false,
          error: err.response?.data?.message || err.message || '無法載入統計數據'
        });
      }
    };

    fetchStats();

    // 🔧 可選：設置定期刷新（每5分鐘）
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return data;
}
