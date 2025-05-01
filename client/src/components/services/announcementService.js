import axios from 'axios';

export const announcementService = {
  // 獲取公告列表
  getAnnouncements: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/announcements?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  // 獲取單一公告
  getAnnouncementById: async (id) => {
    try {
      const response = await axios.get(`/api/announcements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching announcement with id ${id}:`, error);
      throw error;
    }
  }
};
