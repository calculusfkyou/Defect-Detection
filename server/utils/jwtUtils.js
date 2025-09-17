import jwt from 'jsonwebtoken';

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'pcb-defect-detection-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * 生成JWT令牌
 * @param {Object} payload 用戶信息
 * @param {String} expiresIn 過期時間
 * @returns {String} JWT令牌
 */
export const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '1d') => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
};

/**
 * 驗證JWT令牌
 * @param {String} token JWT令牌
 * @returns {Object} 解碼後的令牌信息
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('令牌無效或已過期');
  }
};

/**
 * 設置JWT到Cookie
 * @param {Object} res Express響應對象
 * @param {String} token JWT令牌
 * @param {Boolean} rememberMe 是否記住用戶
 */
export const setTokenCookie = (res, token, rememberMe = false) => {
  const cookieOptions = {
    httpOnly: true, // 防止客戶端JavaScript訪問
    secure: process.env.NODE_ENV === 'production', // 在生產環境中只通過HTTPS發送
    sameSite: 'strict', // 防止CSRF攻擊
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000  // 記住我: 30天
      : 24 * 60 * 60 * 1000       // 普通登入: 24小時
  };

  res.cookie('jwt', token, cookieOptions);
};

/**
 * 清除JWT Cookie
 * @param {Object} res Express響應對象
 */
export const clearTokenCookie = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

export default {
  generateToken,
  verifyToken,
  setTokenCookie,
  clearTokenCookie,
};
