import { verifyToken } from '../utils/jwtUtils.js';
import User from '../model/userModel.js';

/**
 * 檢查用戶是否已登入
 */
export const protect = async (req, res, next) => {
  try {
    // 從Cookie中獲取JWT
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }

    // 驗證JWT
    const decoded = verifyToken(token);

    // 檢查用戶是否存在
    const user = await User.findByPk(decoded.id);

    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: '此用戶不存在或已被停用' });
    }

    // 將用戶信息添加到請求對象中
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // 針對不同錯誤類型提供適當的處理
    console.error(`Authentication error: ${error.message}`, {
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    // 根據錯誤類型返回不同響應
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: '無效的認證令牌' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '認證令牌已過期' });
    }

    // 一般錯誤
    return res.status(500).json({ success: false, message: '伺服器錯誤，請稍後再試' });
  }
};

/**
 * 限制只有特定角色才能訪問
 * @param {Array} roles 允許訪問的角色列表
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '請先登入' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: '您沒有權限執行此操作' });
    }

    next();
  };
};

/**
 * 可選認證 - 檢查用戶是否已登入，但不阻止未登入用戶
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // 從Cookie中獲取JWT
    const token = req.cookies.jwt;

    if (!token) {
      // 沒有token，繼續但不設置用戶
      console.log('⚠️ 可選認證: 未找到JWT令牌，訪客模式');
      return next();
    }

    try {
      // 驗證JWT
      const decoded = verifyToken(token);

      // 檢查用戶是否存在
      const user = await User.findByPk(decoded.id);

      if (user && user.active) {
        // 將用戶信息添加到請求對象中
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        console.log('✅ 可選認證: 用戶已認證', { id: user.id, email: user.email });
      } else {
        console.log('⚠️ 可選認證: 用戶不存在或已停用');
      }
    } catch (tokenError) {
      // Token無效，但不阻止請求
      console.log('⚠️ 可選認證: 無效的token:', tokenError.message);
    }

    next();
  } catch (error) {
    // 如果發生錯誤，繼續但不設置用戶
    console.error('⚠️ 可選認證錯誤:', error);
    next();
  }
};

export default {
  protect,
  restrictTo,
  optionalAuth,
};
