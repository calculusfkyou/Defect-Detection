import AnnouncementModel from '../model/announcementModel.js';

export async function getAnnouncements(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await AnnouncementModel.getAnnouncements(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAnnouncements controller:', error);
    res.status(500).json({ message: '獲取公告失敗' });
  }
}

export async function getAnnouncementById(req, res) {
  try {
    const id = req.params.id;
    const announcement = await AnnouncementModel.getAnnouncementById(id);

    if (!announcement) {
      return res.status(404).json({ message: '找不到該公告' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    console.error('Error in getAnnouncementById controller:', error);
    res.status(500).json({ message: '獲取公告詳情失敗' });
  }
}
