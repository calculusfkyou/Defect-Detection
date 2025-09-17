import User from '../model/userModel.js';
import bcrypt from 'bcrypt';
import { DetectionHistory, DefectDetail } from '../model/detectionHistoryModel.js';
import sequelize from '../config/database.js';

/**
 * 獲取用戶個人資料
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📋 獲取用戶個人資料:', userId);

    // 獲取用戶基本信息
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶資料'
      });
    }

    // 🔧 獲取用戶統計數據
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const { Op } = (await import('sequelize')).default;

    // 並行獲取統計數據
    const [
      totalDetections,
      monthlyDetections,
      totalDefects,
      weeklyDetections,
      avgConfidence,
      lastDetection
    ] = await Promise.all([
      // 總檢測次數
      DetectionHistory.count({ where: { userId } }),

      // 本月檢測次數
      DetectionHistory.count({
        where: {
          userId,
          createdAt: { [Op.gte]: monthStart }
        }
      }),

      // 總瑕疵數量
      DetectionHistory.sum('defectCount', { where: { userId } }),

      // 最近7天檢測次數
      DetectionHistory.count({
        where: {
          userId,
          createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),

      // 平均置信度
      DetectionHistory.findOne({
        where: { userId },
        attributes: [[sequelize.fn('AVG', sequelize.col('averageConfidence')), 'avgConfidence']],
        raw: true
      }),

      // 最後一次檢測
      DetectionHistory.findOne({
        where: { userId },
        order: [['createdAt', 'DESC']],
        attributes: ['createdAt', 'defectCount']
      })
    ]);

    // 🔧 計算品質率
    const defectiveDetections = await DetectionHistory.count({
      where: {
        userId,
        defectCount: { [Op.gt]: 0 }
      }
    });

    const qualityRate = totalDetections > 0
      ? ((totalDetections - defectiveDetections) / totalDetections * 100).toFixed(1)
      : 0;

    // 🔧 獲取最常見的瑕疵類型
    const topDefectTypes = await DefectDetail.findAll({
      include: [{
        model: DetectionHistory,
        where: { userId },
        attributes: []
      }],
      attributes: [
        'defectType',
        [sequelize.fn('COUNT', sequelize.col('DefectDetail.id')), 'count']
      ],
      group: ['defectType'],
      order: [[sequelize.fn('COUNT', sequelize.col('DefectDetail.id')), 'DESC']],
      limit: 3,
      raw: true
    });

    // 🔧 構建響應數據
    const profileData = {
      // 基本用戶信息
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.getAvatarUrl(), // 🔧 使用新的方法獲取頭像 URL
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },

      // 統計數據
      stats: {
        totalDetections: totalDetections || 0,
        monthlyDetections: monthlyDetections || 0,
        weeklyDetections: weeklyDetections || 0,
        totalDefects: totalDefects || 0,
        averageConfidence: avgConfidence?.avgConfidence
          ? Number((avgConfidence.avgConfidence * 100).toFixed(1))
          : 0,
        qualityRate: Number(qualityRate),
        lastDetectionDate: lastDetection?.createdAt || null,
        lastDetectionDefects: lastDetection?.defectCount || 0
      },

      // 瑕疵類型統計
      topDefectTypes: topDefectTypes.map(item => ({
        type: item.defectType,
        name: getDefectChineseName(item.defectType),
        count: parseInt(item.count)
      })),

      // 帳戶信息
      accountInfo: {
        joinDate: user.createdAt,
        status: user.active ? 'active' : 'inactive',
        role: user.role,
        lastLogin: user.lastLogin
      }
    };

    console.log('✅ 個人資料數據準備完成:', {
      userId: profileData.user.id,
      totalDetections: profileData.stats.totalDetections,
      qualityRate: profileData.stats.qualityRate,
      hasAvatar: !!profileData.user.avatar
    });

    return res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('❌ 獲取用戶個人資料失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取個人資料失敗: ' + error.message
    });
  }
};

/**
 * 更新用戶個人資料
 */
export const updateUserProfile = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { name } = req.body; // 🔧 只接收 name，移除 email

    console.log('🔧 更新用戶個人資料:', { userId, name });

    // 🔧 檢查必填欄位（只檢查姓名）
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '姓名為必填欄位'
      });
    }

    // 檢查用戶是否存在
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 🔧 更新用戶資料（只更新姓名）
    await user.update({ name }, { transaction });

    await transaction.commit();

    // 返回更新後的用戶資料（不包含密碼）
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    console.log('✅ 用戶個人資料更新成功:', {
      userId,
      updatedFields: ['name'] // 🔧 只更新姓名
    });

    return res.status(200).json({
      success: true,
      message: '個人資料更新成功',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email, // 🔧 依然返回 email，但不允許更新
          avatar: updatedUser.getAvatarUrl(),
          role: updatedUser.role
        }
      }
    });

  } catch (error) {
    await transaction.rollback();

    // 🔧 移除電子郵件相關的錯誤處理

    console.error('❌ 更新用戶個人資料失敗:', error);
    return res.status(500).json({
      success: false,
      message: '更新個人資料失敗: ' + error.message
    });
  }
};

/**
 * 更改密碼
 */
export const changePassword = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log('🔐 用戶請求更改密碼:', userId);

    // 檢查必填欄位
    if (!currentPassword || !newPassword || !confirmPassword) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '所有密碼欄位都是必填的'
      });
    }

    // 檢查新密碼確認
    if (newPassword !== confirmPassword) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '新密碼與確認密碼不符'
      });
    }

    // 檢查新密碼強度
    if (newPassword.length < 6) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '新密碼長度不能少於6個字符'
      });
    }

    // 檢查新密碼是否與當前密碼相同
    if (currentPassword === newPassword) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '新密碼不能與當前密碼相同'
      });
    }

    // 查找用戶並驗證當前密碼
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 驗證當前密碼
    const isCurrentPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isCurrentPasswordValid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '當前密碼不正確'
      });
    }

    // 更新密碼
    await user.update({ password: newPassword }, { transaction });

    await transaction.commit();

    console.log('✅ 用戶密碼更新成功:', userId);

    return res.status(200).json({
      success: true,
      message: '密碼更新成功'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ 更改密碼失敗:', error);
    return res.status(500).json({
      success: false,
      message: '更改密碼失敗: ' + error.message
    });
  }
};

/**
 * 獲取用戶活動日誌
 */
export const getUserActivityLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    console.log('📋 獲取用戶活動日誌:', { userId, page, limit });

    // 獲取用戶檢測歷史作為活動日誌
    const { count, rows } = await DetectionHistory.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: [
        'id',
        'defectCount',
        'averageConfidence',
        'detectionTime',
        'createdAt'
      ]
    });

    // 🔧 格式化活動日誌
    const activityLog = await Promise.all(
      rows.map(async (record) => {
        // 獲取該檢測的瑕疵類型
        const defectTypes = await DefectDetail.findAll({
          where: { detectionId: record.id },
          attributes: ['defectType'],
          group: ['defectType']
        });

        return {
          id: record.id,
          type: 'detection',
          action: '執行PCB瑕疵檢測',
          description: record.defectCount > 0
            ? `檢測發現 ${record.defectCount} 個瑕疵`
            : '檢測結果：品質良好',
          details: {
            defectCount: record.defectCount,
            confidence: Number((record.averageConfidence * 100).toFixed(1)),
            detectionTime: record.detectionTime,
            defectTypes: defectTypes.map(d => d.defectType)
          },
          timestamp: record.createdAt,
          status: record.defectCount > 0 ? 'warning' : 'success'
        };
      })
    );

    console.log('✅ 活動日誌獲取成功:', {
      totalRecords: count,
      currentPageRecords: activityLog.length
    });

    return res.status(200).json({
      success: true,
      data: {
        activities: activityLog,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ 獲取用戶活動日誌失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取活動日誌失敗: ' + error.message
    });
  }
};

/**
 * 刪除用戶帳戶
 */
export const deleteUserAccount = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { password, confirmDelete } = req.body;

    console.log('🗑️ 用戶請求刪除帳戶:', userId);

    // 檢查必填欄位
    if (!password || confirmDelete !== 'DELETE') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '請輸入密碼並確認刪除操作'
      });
    }

    // 查找用戶並驗證密碼
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 驗證密碼
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '密碼不正確'
      });
    }

    // 🔧 刪除相關數據（級聯刪除）
    // 1. 刪除瑕疵詳情
    await DefectDetail.destroy({
      where: {
        detectionId: {
          [sequelize.Sequelize.Op.in]: sequelize.literal(
            `(SELECT id FROM DetectionHistories WHERE userId = ${userId})`
          )
        }
      },
      transaction
    });

    // 2. 刪除檢測歷史
    await DetectionHistory.destroy({
      where: { userId },
      transaction
    });

    // 3. 刪除用戶帳戶
    await user.destroy({ transaction });

    await transaction.commit();

    console.log('✅ 用戶帳戶刪除成功:', userId);

    // 清除JWT Cookie
    res.clearCookie('jwt');

    return res.status(200).json({
      success: true,
      message: '帳戶已成功刪除'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ 刪除用戶帳戶失敗:', error);
    return res.status(500).json({
      success: false,
      message: '刪除帳戶失敗: ' + error.message
    });
  }
};

/**
 * 獲取用戶頭像（原始二進制數據）
 */
export const getAvatar = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📸 請求用戶頭像:', userId);

    // 查找用戶
    const user = await User.findByPk(userId, {
      attributes: ['avatar', 'avatarMimeType', 'avatarSize']
    });

    if (!user || !user.avatar) {
      return res.status(404).json({
        success: false,
        message: '找不到頭像'
      });
    }

    // 設置適當的響應頭
    res.set({
      'Content-Type': user.avatarMimeType,
      'Content-Length': user.avatarSize,
      'Cache-Control': 'public, max-age=86400', // 快取 24 小時
      'ETag': `"${userId}-${user.avatarSize}"` // 使用用戶ID和文件大小作為ETag
    });

    // 直接返回二進制數據
    return res.send(user.avatar);

  } catch (error) {
    console.error('❌ 獲取頭像失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取頭像失敗: ' + error.message
    });
  }
};

/**
 * 上傳用戶頭像 - 使用中介軟體處理文件
 */
export const uploadAvatar = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;

    if (!req.file) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: '請選擇要上傳的圖片文件'
      });
    }

    console.log('📸 用戶上傳頭像:', {
      userId,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // 查找用戶
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    // 🔧 使用新的方法設置頭像
    user.setAvatar(req.file.buffer, req.file.mimetype);
    await user.save({ transaction });

    await transaction.commit();

    // 🔧 返回頭像的 Data URL 給前端使用
    const avatarUrl = user.getAvatarUrl();

    console.log('✅ 用戶頭像上傳成功:', {
      userId,
      avatarSize: user.avatarSize,
      mimeType: user.avatarMimeType
    });

    return res.status(200).json({
      success: true,
      message: '頭像上傳成功',
      data: {
        avatar: avatarUrl,
        size: user.avatarSize,
        mimeType: user.avatarMimeType
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ 上傳頭像失敗:', error);
    return res.status(500).json({
      success: false,
      message: '上傳頭像失敗: ' + error.message
    });
  }
};

// 🔧 輔助函數：獲取瑕疵類型中文名稱
function getDefectChineseName(defectType) {
  const typeMap = {
    'missing_hole': '缺孔',
    'mouse_bite': '鼠咬',
    'open_circuit': '開路',
    'short': '短路',
    'spur': '毛刺',
    'spurious_copper': '多餘銅'
  };
  return typeMap[defectType] || defectType;
}

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserActivityLog,
  deleteUserAccount,
  uploadAvatar,
  getAvatar
};
