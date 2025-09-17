import User from '../model/userModel.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/jwtUtils.js';
import sequelize from '../config/database.js';

/**
 * 註冊新用戶
 */
// 在 register 函數中添加事務處理
export const register = async (req, res) => {
  // 創建事務
  const transaction = await sequelize.transaction();

  try {
    const { name, email, password } = req.body;

    // 檢查必填欄位
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: '所有欄位都是必填的' });
    }

    // 檢查用戶是否已存在
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: '此電子郵件已被註冊' });
    }

    // 創建新用戶
    const newUser = await User.create({
      name,
      email,
      password,
    }, { transaction });

    // 提交事務
    await transaction.commit();

    // 生成JWT
    const token = generateToken({
      id: newUser.id,
      role: newUser.role
    });

    // 設置Cookie
    setTokenCookie(res, token);

    // 返回用戶信息（不包含密碼）
    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    // 回滾事務
    await transaction.rollback();

    // 更詳細的錯誤處理
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: '此電子郵件已被註冊' });
    }

    console.error('Register error:', error);
    res.status(500).json({ success: false, message: '註冊失敗，請稍後再試' });
  }
};

/**
 * 用戶登入
 */
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // 檢查必填欄位
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '請提供電子郵件和密碼' });
    }

    // 查找用戶並檢查密碼
    const user = await User.findOne({ where: { email } });

    // 使用更通用的錯誤消息，不透露具體是帳號還是密碼錯誤
    if (!user || !(await user.isPasswordCorrect(password))) {
      return res.status(401).json({ success: false, message: '電子郵件或密碼不正確' });
    }

    // 檢查用戶狀態
    if (!user.active) {
      return res.status(401).json({ success: false, message: '您的帳戶已被停用' });
    }

    // 更新最後登入時間
    user.lastLogin = new Date();
    await user.save();

    // 生成JWT
    const token = generateToken({
      id: user.id,
      role: user.role
    });

    // 設置Cookie，增加記住我選項
    setTokenCookie(res, token, rememberMe);

    // 返回用戶信息
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '登入失敗，請稍後再試' });
  }
};

/**
 * 用戶登出
 */
export const logout = (req, res) => {
  // 清除JWT Cookie
  clearTokenCookie(res);
  res.status(200).json({ success: true, message: '成功登出' });
};

/**
 * 獲取當前用戶信息
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: '找不到用戶' });
    }

    // 🔧 構建用戶響應數據，包含頭像 URL
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.getAvatarUrl(), // 🔧 使用新方法獲取頭像 URL
      role: user.role,
      active: user.active,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: '獲取用戶信息失敗' });
  }
};

/**
 * 獲取所有用戶 (僅限管理員)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    // 🔧 為每個用戶添加頭像 URL
    const usersWithAvatars = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.getAvatarUrl(),
      role: user.role,
      active: user.active,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: usersWithAvatars.length,
      users: usersWithAvatars
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: '獲取用戶列表失敗' });
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getAllUsers,
};
