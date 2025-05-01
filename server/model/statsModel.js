class StatsModel {
  // 實際應用中，這些數據應該從數據庫獲取
  static async getStats() {
    // 模擬數據庫查詢
    return {
      totalInspections: 1247,
      defectsFound: 83,
      accuracy: 98.6,
      weeklyInspections: 124
    };
  }
}

export default StatsModel;
