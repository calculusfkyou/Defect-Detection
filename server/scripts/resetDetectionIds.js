import sequelize from '../config/database.js';
import { DetectionHistory, DefectDetail } from '../model/detectionHistoryModel.js';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * 重新排序檢測記錄ID的腳本
 * @param {number} userId - 指定用戶ID，如果不提供則處理所有用戶
 */
const resetDetectionIds = async (userId = null) => {
  const transaction = await sequelize.transaction();

  try {
    console.log('🔄 開始重新排序檢測記錄ID...');

    // 1. 獲取要處理的檢測記錄
    const whereCondition = userId ? { userId } : {};
    const detectionRecords = await DetectionHistory.findAll({
      where: whereCondition,
      order: [['createdAt', 'ASC']], // 按創建時間排序
      transaction
    });

    if (detectionRecords.length === 0) {
      console.log('⚠️ 沒有找到需要處理的檢測記錄');
      await transaction.rollback();
      return { success: true, message: '沒有需要處理的記錄' };
    }

    console.log(`📊 找到 ${detectionRecords.length} 條檢測記錄需要處理`);

    // 2. 暫時禁用外鍵檢查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });

    // 3. 創建臨時表來存儲新的映射關係
    await sequelize.query(`
      CREATE TEMPORARY TABLE id_mapping (
        old_detection_id INT,
        new_detection_id INT,
        user_id INT,
        INDEX(old_detection_id),
        INDEX(new_detection_id)
      )
    `, { transaction });

    // 4. 生成檢測記錄的新ID映射
    const detectionIdMapping = new Map();
    let newDetectionId = 1;

    for (const record of detectionRecords) {
      detectionIdMapping.set(record.id, newDetectionId);

      // 將映射關係插入臨時表
      await sequelize.query(`
        INSERT INTO id_mapping (old_detection_id, new_detection_id, user_id)
        VALUES (?, ?, ?)
      `, {
        replacements: [record.id, newDetectionId, record.userId],
        transaction
      });

      newDetectionId++;
    }

    console.log('📋 檢測記錄ID映射表已創建');

    // 🔧 5. 處理 DefectDetails 表 - 獲取所有相關的瑕疵詳情記錄
    console.log('🔍 處理 DefectDetails 表...');

    const defectDetailsRecords = await DefectDetail.findAll({
      where: {
        detectionId: Array.from(detectionIdMapping.keys())
      },
      order: [['id', 'ASC']], // 按原始ID順序排序
      transaction
    });

    console.log(`📊 找到 ${defectDetailsRecords.length} 條瑕疵詳情記錄需要處理`);

    // 6. 為 DefectDetails 創建ID映射
    const defectDetailIdMapping = new Map();
    let newDefectDetailId = 1;

    for (const defectRecord of defectDetailsRecords) {
      defectDetailIdMapping.set(defectRecord.id, newDefectDetailId);
      newDefectDetailId++;
    }

    console.log('📋 瑕疵詳情ID映射表已創建');

    // 7. 將 DetectionHistory 的ID設為負數（避免衝突）
    console.log('🔄 第一階段：將 DetectionHistory ID 設為負數...');
    for (const [oldId, newId] of detectionIdMapping) {
      await sequelize.query(`
        UPDATE DetectionHistories
        SET id = ?
        WHERE id = ?
      `, {
        replacements: [-oldId, oldId],
        transaction
      });
    }

    // 8. 將 DefectDetails 的ID設為負數，同時更新 detectionId 外鍵
    console.log('🔄 第二階段：將 DefectDetails ID 設為負數並更新外鍵...');
    for (const [oldDefectId, newDefectId] of defectDetailIdMapping) {
      // 獲取該 defect 記錄的原始資料
      const defectRecord = defectDetailsRecords.find(record => record.id === oldDefectId);
      if (!defectRecord) continue;

      // 獲取新的 detectionId
      const newDetectionId = detectionIdMapping.get(defectRecord.detectionId);
      if (!newDetectionId) {
        console.warn(`⚠️ 找不到 detectionId ${defectRecord.detectionId} 的映射`);
        continue;
      }

      await sequelize.query(`
        UPDATE DefectDetails
        SET id = ?, detectionId = ?
        WHERE id = ?
      `, {
        replacements: [-oldDefectId, -newDetectionId, oldDefectId],
        transaction
      });
    }

    console.log('✅ 第一輪更新完成：所有ID已設為負數');

    // 9. 將 DetectionHistory 的負數ID更新為新的正數ID
    console.log('🔄 第三階段：將 DetectionHistory 負數ID 更新為新正數ID...');
    for (const [oldId, newId] of detectionIdMapping) {
      await sequelize.query(`
        UPDATE DetectionHistories
        SET id = ?
        WHERE id = ?
      `, {
        replacements: [newId, -oldId],
        transaction
      });
    }

    // 10. 將 DefectDetails 的負數ID更新為新的正數ID，同時更新 detectionId
    console.log('🔄 第四階段：將 DefectDetails 負數ID 更新為新正數ID...');
    for (const [oldDefectId, newDefectId] of defectDetailIdMapping) {
      // 獲取該 defect 記錄的原始資料
      const defectRecord = defectDetailsRecords.find(record => record.id === oldDefectId);
      if (!defectRecord) continue;

      // 獲取新的 detectionId
      const newDetectionId = detectionIdMapping.get(defectRecord.detectionId);
      if (!newDetectionId) continue;

      await sequelize.query(`
        UPDATE DefectDetails
        SET id = ?, detectionId = ?
        WHERE id = ?
      `, {
        replacements: [newDefectId, newDetectionId, -oldDefectId],
        transaction
      });
    }

    console.log('✅ ID重新排序完成');

    // 11. 重置 AUTO_INCREMENT 值
    const maxDetectionId = Math.max(...detectionIdMapping.values());
    const maxDefectDetailId = defectDetailIdMapping.size > 0 ? Math.max(...defectDetailIdMapping.values()) : 0;

    await sequelize.query(`
      ALTER TABLE DetectionHistories AUTO_INCREMENT = ?
    `, {
      replacements: [maxDetectionId + 1],
      transaction
    });

    await sequelize.query(`
      ALTER TABLE DefectDetails AUTO_INCREMENT = ?
    `, {
      replacements: [maxDefectDetailId + 1],
      transaction
    });

    console.log(`🔧 AUTO_INCREMENT已重置：DetectionHistories = ${maxDetectionId + 1}, DefectDetails = ${maxDefectDetailId + 1}`);

    // 12. 重新啟用外鍵檢查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });

    // 13. 刪除臨時表
    await sequelize.query('DROP TEMPORARY TABLE id_mapping', { transaction });

    await transaction.commit();

    console.log('🎉 檢測記錄和瑕疵詳情ID重新排序完成！');

    return {
      success: true,
      message: `成功重新排序 ${detectionRecords.length} 條檢測記錄和 ${defectDetailsRecords.length} 條瑕疵詳情`,
      processedCount: detectionRecords.length,
      defectDetailsCount: defectDetailsRecords.length,
      detectionIdRange: `1 到 ${maxDetectionId}`,
      defectDetailIdRange: maxDefectDetailId > 0 ? `1 到 ${maxDefectDetailId}` : '無瑕疵記錄',
      nextDetectionId: maxDetectionId + 1,
      nextDefectDetailId: maxDefectDetailId + 1
    };

  } catch (error) {
    await transaction.rollback();
    console.error('❌ ID重新排序失敗:', error);

    // 確保重新啟用外鍵檢查
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (fkError) {
      console.error('❌ 重新啟用外鍵檢查失敗:', fkError);
    }

    throw error;
  }
};

/**
 * 重新排序特定用戶的檢測記錄ID
 */
const resetUserDetectionIds = async (userId) => {
  console.log(`👤 重新排序用戶 ${userId} 的檢測記錄ID`);
  return await resetDetectionIds(userId);
};

/**
 * 重新排序所有用戶的檢測記錄ID（按用戶分組）
 */
const resetAllUsersDetectionIds = async () => {
  try {
    console.log('🌍 重新排序所有用戶的檢測記錄ID');

    // 獲取所有有檢測記錄的用戶
    const users = await sequelize.query(`
      SELECT DISTINCT userId
      FROM DetectionHistories
      ORDER BY userId
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`👥 找到 ${users.length} 個用戶有檢測記錄`);

    const results = [];

    for (const user of users) {
      console.log(`\n處理用戶 ${user.userId}...`);
      const result = await resetDetectionIds(user.userId);
      results.push({
        userId: user.userId,
        ...result
      });
    }

    return {
      success: true,
      message: `成功處理 ${users.length} 個用戶的檢測記錄`,
      results
    };

  } catch (error) {
    console.error('❌ 批量重新排序失敗:', error);
    throw error;
  }
};

export {
  resetDetectionIds,
  resetUserDetectionIds,
  resetAllUsersDetectionIds
};

// 獲取當前文件路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 修復執行檢測邏輯
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

console.log('🚀 腳本載入中...', {
  currentFile: __filename,
  processArgv1: process.argv[1],
  isMainModule
});

if (isMainModule) {
  console.log('✅ 腳本作為主模組執行');
  const args = process.argv.slice(2);
  const userId = args[0] ? parseInt(args[0]) : null;

  console.log('📋 執行參數:', { args, userId });

  (async () => {
    try {
      console.log('🔄 開始執行腳本...');

      if (userId) {
        console.log(`🎯 指定用戶模式：用戶ID ${userId}`);
        const result = await resetUserDetectionIds(userId);
        console.log('✅ 結果:', result);
      } else {
        console.log('🌍 全域模式：處理所有用戶');
        const result = await resetAllUsersDetectionIds();
        console.log('✅ 結果:', result);
      }

      console.log('🎉 腳本執行完成');
      process.exit(0);
    } catch (error) {
      console.error('❌ 腳本執行失敗:', error);
      console.error('錯誤堆疊:', error.stack);
      process.exit(1);
    }
  })();
} else {
  console.log('ℹ️ 腳本作為模組被導入');
}
