import axios from 'axios';

// 創建具有授權功能的axios實例
const authAxios = axios.create({
  withCredentials: true,  // 允許跨域請求帶上 cookies
});

// 請求攔截器
authAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // 如果是認證錯誤（401）且不是重試請求，則嘗試刷新令牌或重定向到登入頁
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 在實際應用中，這裡可以添加刷新令牌的邏輯
      // 或者，直接重定向到登入頁
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default authAxios;
