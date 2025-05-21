import axios from 'axios';

const API_URL = 'http://localhost:5000/api/about';

// 獲取團隊成員資料
export async function getTeamMembers() {
  try {
    const response = await axios.get(`${API_URL}/team`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

// 獲取使命願景資料
export async function getMissionVision() {
  try {
    const response = await axios.get(`${API_URL}/mission-vision`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mission vision:', error);
    throw error;
  }
}

// 獲取技術堆疊資料
export async function getTechStack() {
  try {
    const response = await axios.get(`${API_URL}/tech-stack`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    throw error;
  }
}

// 獲取專案時間線資料
export async function getProjectTimeline() {
  try {
    const response = await axios.get(`${API_URL}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project timeline:', error);
    throw error;
  }
}

// 獲取聯絡資訊
export async function getContactInfo() {
  try {
    const response = await axios.get(`${API_URL}/contact`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    throw error;
  }
}

// 一次性獲取所有關於頁面數據
export async function getAllAboutData() {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching all about data:', error);
    throw error;
  }
}
