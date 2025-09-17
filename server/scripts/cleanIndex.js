import sequelize from '../config/database.js';

async function cleanupUserIndexes() {
  try {
    console.log('🗃️ 開始清理 Users 表索引...');

    // 連接數據庫
    await sequelize.authenticate();
    console.log('✅ 數據庫連接成功');

    // 獲取當前所有索引
    const [indexes] = await sequelize.query(`SHOW INDEX FROM Users WHERE Key_name LIKE 'email%'`);
    console.log(`📊 找到 ${indexes.length} 個 email 相關索引`);

    // 保留 PRIMARY 和一個 email 唯一索引，刪除其餘所有索引
    const indexesToKeep = ['PRIMARY', 'users_email_unique'];
    const indexesToDelete = [];

    // 收集需要刪除的索引名稱
    const uniqueIndexNames = [...new Set(indexes.map(idx => idx.Key_name))];

    for (const indexName of uniqueIndexNames) {
      if (!indexesToKeep.includes(indexName)) {
        indexesToDelete.push(indexName);
      }
    }

    console.log(`🗑️ 將刪除 ${indexesToDelete.length} 個多餘索引:`, indexesToDelete);

    // 禁用外鍵約束檢查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 已禁用外鍵約束檢查');

    // 逐一刪除多餘索引
    let successCount = 0;
    let failCount = 0;

    for (const indexName of indexesToDelete) {
      try {
        await sequelize.query(`ALTER TABLE Users DROP INDEX \`${indexName}\``);
        console.log(`✅ 成功刪除索引: ${indexName}`);
        successCount++;
      } catch (error) {
        console.error(`❌ 刪除索引 ${indexName} 失敗:`, error.message);
        failCount++;
      }
    }

    // 確保至少有一個 email 唯一索引
    try {
      // 檢查是否還有 email 唯一索引
      const [remainingIndexes] = await sequelize.query(`SHOW INDEX FROM Users WHERE Key_name = 'users_email_unique'`);

      if (remainingIndexes.length === 0) {
        // 如果沒有，創建一個新的
        await sequelize.query(`ALTER TABLE Users ADD UNIQUE KEY users_email_unique (email)`);
        console.log('✅ 創建新的 email 唯一索引');
      }
    } catch (error) {
      console.error('❌ 檢查/創建 email 索引失敗:', error.message);
    }

    // 重新啟用外鍵約束檢查
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 已重新啟用外鍵約束檢查');

    console.log(`🎯 索引清理完成！成功: ${successCount}, 失敗: ${failCount}`);

    // 驗證最終結果
    const [finalIndexes] = await sequelize.query(`SHOW INDEX FROM Users`);
    console.log('📋 清理後的索引列表:');
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.Key_name} (${idx.Column_name})`);
    });

  } catch (error) {
    console.error('❌ 清理索引失敗:', error);
  } finally {
    // 確保重新啟用外鍵約束
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {
      console.error('❌ 重新啟用外鍵約束失敗:', e.message);
    }

    await sequelize.close();
    console.log('🔌 數據庫連接已關閉');
  }
}

// 執行清理
cleanupUserIndexes();
