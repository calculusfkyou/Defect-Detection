import { DetectionHistory, DefectDetail, DetectionModel } from '../model/detectionHistoryModel.js';
import { runDetection } from '../utils/modelUtils.js';
import fs from 'fs';
import path from 'path';

/**
 * 處理PCB圖像瑕疵檢測
 */
export const detectDefects = async (req, res) => {
  try {
    // 檢查是否有上傳文件
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '請上傳PCB圖像'
      });
    }

    // 從請求中獲取參數
    const confidenceThreshold = parseFloat(req.body.confidenceThreshold) || 0.5;
    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;

    // 執行檢測
    const detectionResult = await runDetection(imageBuffer, confidenceThreshold);

    // 獲取已登入用戶的ID (如果有)
    const userId = req.user?.id;

    // 如果用戶已登入，保存檢測記錄
    let savedHistory = null;
    if (userId) {
      try {
        // 創建檢測歷史記錄
        savedHistory = await DetectionHistory.create({
          userId,
          originalImage: imageBuffer,
          originalImageType: imageType,
          resultImage: detectionResult.resultImage,
          defectCount: detectionResult.defectCount,
          averageConfidence: detectionResult.averageConfidence,
          detectionTime: detectionResult.detectionTime
        });

        // 保存每個瑕疵的詳情
        for (const defect of detectionResult.defects) {
          await DefectDetail.create({
            detectionId: savedHistory.id,
            defectType: defect.defectType,
            classId: defect.classId,
            xCenter: defect.xCenter,
            yCenter: defect.yCenter,
            width: defect.width,
            height: defect.height,
            confidence: defect.confidence,
            thumbnailImage: defect.thumbnail
          });
        }
      } catch (saveError) {
        console.error('保存檢測歷史記錄失敗:', saveError);
        // 繼續處理，不影響返回結果
      }
    }

    // 將圖像轉換為base64以便前端顯示
    const originalBase64 = `data:${imageType};base64,${imageBuffer.toString('base64')}`;
    const resultBase64 = `data:image/jpeg;base64,${detectionResult.resultImage.toString('base64')}`;

    // 準備瑕疵詳情的輸出格式
    const processedDefects = detectionResult.defects.map((defect) => {
      // 轉換縮圖為base64
      const thumbnailBase64 = defect.thumbnail
        ? `data:image/jpeg;base64,${defect.thumbnail.toString('base64')}`
        : null;

      return {
        id: defect.id,
        type: defect.defectType,
        confidence: defect.confidence,
        box: {
          x: defect.xCenter,
          y: defect.yCenter,
          width: defect.width,
          height: defect.height
        },
        thumbnail: thumbnailBase64,
        description: getDefectDescription(defect.defectType),
        recommendation: getDefectRecommendation(defect.defectType)
      };
    });

    // 返回檢測結果
    return res.status(200).json({
      success: true,
      data: {
        originalImage: originalBase64,
        resultImage: resultBase64,
        defects: processedDefects,
        summary: {
          totalDefects: detectionResult.defectCount,
          averageConfidence: detectionResult.averageConfidence,
          detectionTime: detectionResult.detectionTime
        },
        savedHistoryId: savedHistory?.id
      }
    });
  } catch (error) {
    console.error('檢測失敗:', error);
    return res.status(500).json({
      success: false,
      message: '檢測過程中發生錯誤: ' + error.message
    });
  }
};

/**
 * 獲取用戶的檢測歷史記錄
 */
export const getUserDetectionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 查詢用戶的檢測歷史記錄
    const { count, rows } = await DetectionHistory.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // 格式化結果 (不返回大型二進制數據，以減少響應大小)
    const history = await Promise.all(rows.map(async (record) => {
      // 查詢該記錄的瑕疵數據
      const defects = await DefectDetail.findAll({
        where: { detectionId: record.id }
      });

      // 統計瑕疵類型
      const defectTypes = [...new Set(defects.map(d => d.defectType))];

      return {
        id: record.id,
        defectCount: record.defectCount,
        averageConfidence: record.averageConfidence,
        detectionTime: record.detectionTime,
        createdAt: record.createdAt,
        defectTypes
      };
    }));

    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('獲取檢測歷史記錄失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取檢測歷史記錄失敗: ' + error.message
    });
  }
};

/**
 * 獲取特定檢測記錄的詳情
 */
export const getDetectionDetails = async (req, res) => {
  try {
    const detectionId = req.params.id;
    const userId = req.user.id;

    // 查詢檢測記錄
    const detectionRecord = await DetectionHistory.findOne({
      where: { id: detectionId, userId }
    });

    if (!detectionRecord) {
      return res.status(404).json({
        success: false,
        message: '檢測記錄不存在或您無權訪問'
      });
    }

    // 查詢該記錄的所有瑕疵詳情
    const defectDetails = await DefectDetail.findAll({
      where: { detectionId }
    });

    // 處理瑕疵詳情
    const defects = defectDetails.map(defect => {
      // 將縮圖轉換為BASE64
      const thumbnailBase64 = defect.thumbnailImage
        ? `data:image/jpeg;base64,${defect.thumbnailImage.toString('base64')}`
        : null;

      return {
        id: defect.id,
        type: defect.defectType,
        confidence: defect.confidence,
        box: {
          x: defect.xCenter,
          y: defect.yCenter,
          width: defect.width,
          height: defect.height
        },
        thumbnail: thumbnailBase64,
        description: getDefectDescription(defect.defectType),
        recommendation: getDefectRecommendation(defect.defectType)
      };
    });

    // 將原始圖像和結果圖像轉換為BASE64
    const originalImageBase64 = `data:${detectionRecord.originalImageType};base64,${detectionRecord.originalImage.toString('base64')}`;
    const resultImageBase64 = `data:image/jpeg;base64,${detectionRecord.resultImage.toString('base64')}`;

    return res.status(200).json({
      success: true,
      data: {
        id: detectionRecord.id,
        originalImage: originalImageBase64,
        resultImage: resultImageBase64,
        defects,
        summary: {
          totalDefects: detectionRecord.defectCount,
          averageConfidence: detectionRecord.averageConfidence,
          detectionTime: detectionRecord.detectionTime
        },
        createdAt: detectionRecord.createdAt
      }
    });
  } catch (error) {
    console.error('獲取檢測詳情失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取檢測詳情失敗: ' + error.message
    });
  }
};

/**
 * 管理員功能：上傳新模型
 */
export const uploadModel = async (req, res) => {
  try {
    // 檢查是否為管理員
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有管理員可以上傳模型'
      });
    }

    // 檢查文件上傳
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '請上傳ONNX模型檔案'
      });
    }

    const { modelName, modelVersion } = req.body;
    if (!modelName || !modelVersion) {
      return res.status(400).json({
        success: false,
        message: '請提供模型名稱和版本'
      });
    }

    // 生成唯一的文件名
    const fileName = `${modelName.replace(/\s+/g, '_')}_v${modelVersion}_${Date.now()}.onnx`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'model');
    const filePath = path.join(uploadDir, fileName);
    const relativePath = path.join('uploads', 'model', fileName).replace(/\\/g, '/');

    // 寫入文件到磁盤
    fs.writeFileSync(filePath, req.file.buffer);
    console.log(`模型已保存至: ${filePath}`);

    // 如果要上傳新的活躍模型，先將所有現有模型設為非活躍
    if (req.body.isActive === 'true') {
      await DetectionModel.update(
        { isActive: false },
        { where: { isActive: true } }
      );
    }

    // 創建新模型記錄
    const newModel = await DetectionModel.create({
      modelName,
      modelVersion,
      modelFile: relativePath, // 存儲相對路徑
      isActive: req.body.isActive === 'true',
      uploadedBy: req.user.id
    });

    return res.status(201).json({
      success: true,
      data: {
        id: newModel.id,
        modelName,
        modelVersion,
        isActive: newModel.isActive,
        uploadedAt: newModel.uploadedAt
      }
    });
  } catch (error) {
    console.error('上傳模型失敗:', error);
    return res.status(500).json({
      success: false,
      message: '上傳模型失敗: ' + error.message
    });
  }
};

/**
 * 初始模型設置 - 將本地模型文件加載到數據庫
 */
export const initializeModel = async () => {
  try {
    console.log('開始檢查模型...');
    // 檢查數據庫中是否已有模型
    const modelCount = await DetectionModel.count();
    if (modelCount > 0) {
      console.log('數據庫中已存在模型記錄，跳過初始化');
      return;
    }

    // 檢查本地模型文件 - 使用相對路徑
    const modelRelativePath = 'model/best.onnx';
    const modelAbsolutePath = path.resolve(process.cwd(), modelRelativePath);
    console.log('檢查模型文件:', modelAbsolutePath);

    if (!fs.existsSync(modelAbsolutePath)) {
      console.error('找不到本地模型文件:', modelAbsolutePath);
      return;
    }

    const modelSizeMB = Math.round(fs.statSync(modelAbsolutePath).size / 1024 / 1024);
    console.log('模型文件存在，大小:', modelSizeMB, 'MB');

    // 創建模型記錄 (只存儲相對路徑)
    await DetectionModel.create({
      modelName: 'PCB瑕疵檢測模型Yolov11x',
      modelVersion: '1.0',
      modelFile: modelRelativePath, // 存儲相對路徑
      isActive: true,
      uploadedBy: null
    });

    console.log('初始模型路徑記錄完成 (使用相對路徑)');
  } catch (error) {
    console.error('初始模型設置失敗:', error);
  }
};

// 輔助函數 - 獲取瑕疵類型的說明
function getDefectDescription(defectType) {
  const descriptions = {
    'missing_hole': '印刷電路板上應有的孔洞缺失，可能導致元件無法正確安裝或連接。',
    'mouse_bite': '電路板邊緣出現類似被咬過的缺口，可能影響機械強度和電氣連接。',
    'open_circuit': '電路導線中斷，電流無法通過，導致電路功能失效。',
    'short': '不應相連的導線或電路部分意外相連，可能導致短路或功能異常。',
    'spur': '導線或銅箔上出現不規則的突起或尖刺，可能導致短路風險。',
    'spurious_copper': '電路板上出現多餘的銅箔，可能導致短路或干擾信號傳輸。'
  };

  return descriptions[defectType] || '未知瑕疵類型';
}

// 輔助函數 - 獲取瑕疵的建議處理方法
function getDefectRecommendation(defectType) {
  const recommendations = {
    'missing_hole': '重新加工PCB，確保正確鑽孔；或評估是否可以手動鑽孔修復。',
    'mouse_bite': '評估瑕疵的嚴重程度，輕微情況可能不影響功能；嚴重情況可能需要重新製造。',
    'open_circuit': '使用導電膠或焊接方式修復中斷的線路；或在可能的情況下添加跳線。',
    'short': '仔細移除造成短路的多餘導電材料；使用精細工具如刀片或砂紙隔離相連的線路。',
    'spur': '使用精細工具小心移除多餘的尖刺或突起，避免損傷正常線路。',
    'spurious_copper': '評估多餘銅箔的位置和影響，使用適當工具移除，確保不損壞周圍電路。'
  };

  return recommendations[defectType] || '請咨詢PCB製造專家進行評估和處理';
}
