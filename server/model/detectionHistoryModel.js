import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './userModel.js';

// 檢測歷史記錄資料表
const DetectionHistory = sequelize.define('DetectionHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  originalImage: {
    type: DataTypes.BLOB('long'), // 原始圖片數據
    allowNull: false,
  },
  originalImageType: {
    type: DataTypes.STRING, // 圖片MIME類型
    allowNull: false,
  },
  resultImage: {
    type: DataTypes.BLOB('long'), // 處理後圖片數據
    allowNull: false,
  },
  defectCount: {
    type: DataTypes.INTEGER, // 檢出瑕疵總數
    allowNull: false,
    defaultValue: 0,
  },
  averageConfidence: {
    type: DataTypes.FLOAT, // 平均置信度
    allowNull: false,
    defaultValue: 0,
  },
  detectionTime: {
    type: DataTypes.INTEGER, // 檢測耗時(毫秒)
    allowNull: false,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

// 瑕疵詳情資料表
const DefectDetail = sequelize.define('DefectDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  detectionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DetectionHistory,
      key: 'id'
    }
  },
  defectType: {
    type: DataTypes.STRING, // 瑕疵類型名稱
    allowNull: false,
  },
  classId: {
    type: DataTypes.INTEGER, // 類別ID
    allowNull: false,
  },
  xCenter: {
    type: DataTypes.FLOAT, // x中心座標
    allowNull: false,
  },
  yCenter: {
    type: DataTypes.FLOAT, // y中心座標
    allowNull: false,
  },
  width: {
    type: DataTypes.FLOAT, // 寬度
    allowNull: false,
  },
  height: {
    type: DataTypes.FLOAT, // 高度
    allowNull: false,
  },
  confidence: {
    type: DataTypes.FLOAT, // 置信度
    allowNull: false,
  },
  thumbnailImage: {
    type: DataTypes.BLOB('medium'), // 瑕疵縮圖
    allowNull: true,
  },
});

// 模型資料表
const DetectionModel = sequelize.define('DetectionModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  modelName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modelVersion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modelFile: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  uploadedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

// 建立關聯關係
DetectionHistory.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(DetectionHistory, { foreignKey: 'userId' });

DefectDetail.belongsTo(DetectionHistory, { foreignKey: 'detectionId' });
DetectionHistory.hasMany(DefectDetail, { foreignKey: 'detectionId' });

export { DetectionHistory, DefectDetail, DetectionModel };
export default DetectionHistory;
