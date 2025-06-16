import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'users_email_unique', // 明確指定索引名稱
      msg: 'Email已被使用'
    },
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.BLOB('medium'),
    allowNull: true,
    defaultValue: null
  },
  avatarMimeType: {
    type: DataTypes.STRING, // 存儲圖片的 MIME 類型
    allowNull: true,
    defaultValue: null
  },
  avatarSize: {
    type: DataTypes.INTEGER, // 存儲圖片大小（字節）
    allowNull: true,
    defaultValue: null
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// 檢查密碼是否正確
User.prototype.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 獲取頭像 URL
User.prototype.getAvatarUrl = function () {
  if (this.avatar && this.avatarMimeType) {
    // 返回可用於前端的數據 URL
    const base64Data = this.avatar.toString('base64');
    return `data:${this.avatarMimeType};base64,${base64Data}`;
  }
  return null;
};

// 設置頭像
User.prototype.setAvatar = function (buffer, mimeType) {
  this.avatar = buffer;
  this.avatarMimeType = mimeType;
  this.avatarSize = buffer ? buffer.length : null;
};

// 初始化預設用戶
const initDefaultUsers = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }

    const userExists = await User.findOne({ where: { email: 'user@example.com' } });
    if (!userExists) {
      await User.create({
        name: 'Normal User',
        email: 'user@example.com',
        password: 'user123',
        role: 'user'
      });
      console.log('Normal user created successfully');
    }
  } catch (error) {
    console.error('Error initializing default users:', error);
  }
};

export { initDefaultUsers };
export default User;
