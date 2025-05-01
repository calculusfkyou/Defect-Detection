import StatsModel from '../model/statsModel.js';  // 注意路徑是 model 不是 models

export async function getStats(req, res) {
  try {
    const stats = await StatsModel.getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getStats controller:', error);
    res.status(500).json({ message: '獲取統計數據失敗' });
  }
}
