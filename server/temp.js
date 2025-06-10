import sequelize from './config/database.js';

async function cleanupIndexes() {
  try {
    console.log('連接數據庫成功，開始清理索引...');

    // 0. 禁用外鍵約束檢查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('已禁用外鍵約束檢查');

    // 1. 刪除臨時表（如果存在）
    try {
      await sequelize.query(`DROP TABLE IF EXISTS Users_temp;`);
      console.log('已刪除可能存在的臨時表');
    } catch (e) {
      console.log('刪除臨時表失敗:', e.message);
    }

    // 2. 創建臨時表，複製結構
    await sequelize.query(`CREATE TABLE Users_temp LIKE Users;`);
    console.log('創建臨時表成功');

    // 3. 刪除臨時表上所有email相關索引
    try {
      await sequelize.query(`ALTER TABLE Users_temp DROP INDEX email;`);
      console.log('刪除基本email索引成功');
    } catch (e) {
      console.log('索引可能不存在:', e.message);
    }

    // 4. 嘗試刪除email_2到email_63
    for (let i = 2; i <= 63; i++) {
      try {
        await sequelize.query(`ALTER TABLE Users_temp DROP INDEX email_${i};`);
        console.log(`刪除email_${i}索引成功`);
      } catch (e) {
        // 忽略錯誤
      }
    }

    // 5. 添加一個正確的email唯一索引
    await sequelize.query(`ALTER TABLE Users_temp ADD UNIQUE INDEX users_email_unique (email);`);
    console.log('添加新索引成功');

    // 6. 複製數據
    await sequelize.query(`INSERT INTO Users_temp SELECT * FROM Users;`);
    console.log('數據複製成功');

    // 7. 替換表
    await sequelize.query(`DROP TABLE Users;`);
    console.log('刪除原表成功');

    await sequelize.query(`RENAME TABLE Users_temp TO Users;`);
    console.log('重命名表成功');

    // 8. 更新DetectionHistories表使用的外鍵
    try {
      // 修復可能已經斷開的外鍵
      await sequelize.query(`
        ALTER TABLE DetectionHistories
        ADD CONSTRAINT DetectionHistories_ibfk_1
        FOREIGN KEY (userId) REFERENCES Users(id);
      `);
      console.log('已修復DetectionHistories的外鍵');
    } catch (e) {
      console.log('修復外鍵失敗，可能已存在:', e.message);
    }

    console.log('索引清理完成！現在應該只有一個email索引。');

  } catch (error) {
    console.error('清理索引失敗:', error);
  } finally {
    // 重要：確保無論成功失敗都重新啟用外鍵約束
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('已重新啟用外鍵約束檢查');
    } catch (e) {
      console.error('重新啟用外鍵約束失敗:', e.message);
    }

    await sequelize.close();
    console.log('數據庫連接已關閉');
  }
}

cleanupIndexes();
