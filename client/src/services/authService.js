import axios from 'axios';

const API_URL = '/api/auth';

/**
 * 用戶註冊
 * @param {Object} userData 用戶資料
 * @returns {Promise} 註冊結果
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // 允許跨域請求帶上 cookies
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '註冊過程中發生錯誤' };
  }
};

/**
 * 用戶登入
 * @param {Object} credentials 登入憑證
 * @returns {Promise} 登入結果
 */
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '登入過程中發生錯誤' };
  }
};

/**
 * 用戶登出
 * @returns {Promise} 登出結果
 */
export const logoutUser = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`, {}, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '登出過程中發生錯誤' };
  }
};

/**
 * 獲取當前登入用戶信息
 * @returns {Promise} 用戶信息
 */
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    // 401 未授權是預期的錯誤 - 用戶尚未登入
    if (error.response?.status === 401) {
      throw { status: 401, message: '用戶未登入' };
    }

    // 其他錯誤
    console.error('獲取用戶信息失敗:', error);
    throw error.response?.data || { message: '獲取用戶信息失敗' };
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
