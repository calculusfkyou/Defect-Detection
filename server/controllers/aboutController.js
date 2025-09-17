import AboutModel from '../model/aboutModel.js';

// 獲取團隊成員資訊
export async function getTeamMembers(req, res) {
  try {
    const teamMembers = await AboutModel.getTeamMembers();
    res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: '獲取團隊成員資訊失敗' });
  }
}

// 獲取使命願景資訊
export async function getMissionVision(req, res) {
  try {
    const missionVision = await AboutModel.getMissionVision();
    res.json(missionVision);
  } catch (error) {
    console.error('Error fetching mission and vision:', error);
    res.status(500).json({ message: '獲取使命願景資訊失敗' });
  }
}

// 獲取技術堆疊資訊
export async function getTechStack(req, res) {
  try {
    const techStack = await AboutModel.getTechStack();
    res.json(techStack);
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    res.status(500).json({ message: '獲取技術堆疊資訊失敗' });
  }
}

// 獲取專案時間線
export async function getProjectTimeline(req, res) {
  try {
    const timeline = await AboutModel.getProjectTimeline();
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching project timeline:', error);
    res.status(500).json({ message: '獲取專案時間線失敗' });
  }
}

// 獲取聯絡資訊
export async function getContactInfo(req, res) {
  try {
    const contactInfo = await AboutModel.getContactInfo();
    res.json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    res.status(500).json({ message: '獲取聯絡資訊失敗' });
  }
}

// 一次性獲取所有關於頁面資料
export async function getAllAboutData(req, res) {
  try {
    const aboutData = await AboutModel.getAllAboutData();
    res.json(aboutData);
  } catch (error) {
    console.error('Error fetching all about data:', error);
    res.status(500).json({ message: '獲取關於頁面資料失敗' });
  }
}
