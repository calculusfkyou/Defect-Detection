import fs from 'fs';
import path from 'path';
import * as onnx from 'onnxruntime-node';
import sharp from 'sharp';
import { DetectionModel } from '../model/detectionHistoryModel.js';
import float16 from 'float16';
import axios from 'axios';

// 定義類別名稱 (從data.yaml中獲取)
const CLASS_NAMES = ['missing_hole', 'mouse_bite', 'open_circuit', 'short', 'spur', 'spurious_copper'];
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

/**
 * 獲取瑕疵類型的中文描述
 * @param {string} defectType 瑕疵類型
 * @returns {string} 中文描述
 */
export const getDefectDescription = (defectType) => {
  const descriptions = {
    'missing_hole': '缺少應有的鑽孔，可能影響元件安裝或電路連接。這是製造過程中常見的問題，通常由鑽孔機械故障或程序錯誤造成。',
    'mouse_bite': '電路板邊緣出現小孔或凹陷，形狀類似鼠咬痕跡。通常是由於切割或沖壓過程中工具磨損或參數設置不當造成。',
    'open_circuit': '應該相連的電路出現斷開，導致電流無法正常流通。這可能是由於蝕刻過度、機械損傷或設計缺陷造成。',
    'short': '不應該相連的電路意外連接，可能導致電流走向錯誤。通常由於蝕刻不足、金屬殘留或污染造成。',
    'spur': '電路線路上出現多餘的金屬突起或尖刺，可能影響電路性能或造成短路風險。',
    'spurious_copper': '電路板上出現不應存在的多餘銅箔，可能影響電路功能或造成意外連接。'
  };

  return descriptions[defectType] || `檢測到 ${defectType} 類型的瑕疵，需要進一步檢查確認。`;
};

/**
 * 獲取瑕疵類型的處理建議
 * @param {string} defectType 瑕疵類型
 * @returns {string} 處理建議
 */
export const getDefectRecommendation = (defectType) => {
  const recommendations = {
    'missing_hole': '建議：1. 檢查鑽孔程序和機械設備 2. 補鑽缺失的孔位 3. 驗證孔位尺寸和位置 4. 更新製造流程控制',
    'mouse_bite': '建議：1. 檢查切割工具狀態 2. 調整切割參數 3. 更換磨損的工具 4. 改善夾具固定方式 5. 考慮後處理平整邊緣',
    'open_circuit': '建議：1. 檢查蝕刻工藝參數 2. 驗證設計規則 3. 修復斷開的連線 4. 加強品質控制檢測 5. 考慮重新製作',
    'short': '建議：1. 清除多餘的金屬連接 2. 改善蝕刻工藝 3. 檢查清潔流程 4. 加強防污染措施 5. 驗證電路功能',
    'spur': '建議：1. 移除多餘的金屬突起 2. 改善蝕刻均勻性 3. 檢查蝕刻液狀態 4. 調整工藝參數 5. 加強後處理檢查',
    'spurious_copper': '建議：1. 清除多餘的銅箔 2. 檢查蝕刻完整性 3. 改善製程控制 4. 驗證設計文件 5. 加強品質檢驗'
  };

  return recommendations[defectType] || `建議對 ${defectType} 瑕疵進行詳細分析，並採取適當的修復措施。`;
};

/**
 * 獲取瑕疵類型的嚴重等級
 * @param {string} defectType 瑕疵類型
 * @returns {string} 嚴重等級 (low, medium, high, critical)
 */
export const getDefectSeverity = (defectType) => {
  const severityMap = {
    'missing_hole': 'high',        // 缺孔會影響組裝
    'mouse_bite': 'medium',        // 影響外觀，可能影響機械強度
    'open_circuit': 'critical',    // 會導致功能失效
    'short': 'critical',           // 會導致功能異常或損壞
    'spur': 'medium',              // 可能影響性能
    'spurious_copper': 'high'      // 可能影響功能
  };

  return severityMap[defectType] || 'medium';
};

/**
 * 獲取瑕疵類型的中文名稱
 * @param {string} defectType 瑕疵類型
 * @returns {string} 中文名稱
 */
export const getDefectChineseName = (defectType) => {
  const chineseNames = {
    'missing_hole': '缺孔',
    'mouse_bite': '鼠咬',
    'open_circuit': '開路',
    'short': '短路',
    'spur': '毛刺',
    'spurious_copper': '多餘銅'
  };

  return chineseNames[defectType] || defectType;
};

/**
 * 從數據庫中獲取活躍的模型 (備用方法)
 */
export const getActiveModel = async () => {
  try {
    const activeModel = await DetectionModel.findOne({
      where: { isActive: true },
      order: [['uploadedAt', 'DESC']]
    });

    if (!activeModel) {
      throw new Error('找不到活躍的檢測模型');
    }

    return activeModel;
  } catch (error) {
    console.error('獲取模型失敗:', error);
    throw error;
  }
};

/**
 * 預處理圖像為模型輸入格式
 * @param {Buffer} imageBuffer 圖像緩衝區
 */
export const preprocessImage = async (imageBuffer) => {
  try {
    console.log('預處理圖像開始，buffer 大小:', imageBuffer.length);

    // 獲取圖像信息
    const metadata = await sharp(imageBuffer).metadata();
    console.log('圖像信息:', metadata);

    // 先轉換為標準格式，避免不同圖像格式問題
    const standardImage = await sharp(imageBuffer)
      .toFormat('jpeg') // 統一轉換為JPEG格式
      .toBuffer();

    // 調整圖像到模型需要的尺寸 (640x640)
    const resizedImage = await sharp(standardImage)
      .resize(640, 640, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .raw()
      .toBuffer();

    // 轉換為Float32Array
    const tensor = new Float32Array(640 * 640 * 3);

    // 將pixel值轉換為0-1範圍的浮點數，並重排為[1, 3, 640, 640]格式 (NCHW)
    for (let c = 0; c < 3; c++) {
      for (let h = 0; h < 640; h++) {
        for (let w = 0; w < 640; w++) {
          const srcIdx = (h * 640 + w) * 3 + c;
          const dstIdx = c * 640 * 640 + h * 640 + w;
          tensor[dstIdx] = resizedImage[srcIdx] / 255.0;
        }
      }
    }

    return {
      tensor,
      originalDims: { width: metadata.width, height: metadata.height },
      metadata
    };
  } catch (error) {
    console.error('圖像預處理失敗:', error);
    throw error;
  }
};

/**
 * 使用Python FastAPI服務進行檢測
 * 使用ONNX運行YOLO模型進行檢測
 * @param {Buffer} imageBuffer 原始圖像數據
 * @param {number} confidenceThreshold 置信度閾值
 */
export const runDetection = async (imageBuffer, confidenceThreshold = 0.5) => {
  try {
    const startTime = Date.now();
    console.log('🔍 開始檢測，置信度閾值:', confidenceThreshold);

    // 檢查Python服務是否可用
    try {
      console.log('🔌 檢查Python服務連接...');
      const healthResponse = await axios.get(`${PYTHON_API_URL}/health`, { timeout: 5000 });
      console.log('✅ Python服務健康狀態:', healthResponse.data);
    } catch (healthError) {
      console.error('❌ Python檢測服務不可用:', healthError.message);
      throw new Error('Python檢測服務不可用，請確保服務正在運行於端口8000');
    }

    const FormData = (await import('form-data')).default;
    const formData = new FormData();

    formData.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
      knownLength: imageBuffer.length
    });

    formData.append('confidence_threshold', confidenceThreshold.toString());

    console.log('📤 發送檢測請求到Python服務...');

    const response = await axios.post(`${PYTHON_API_URL}/detect`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 120000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('🔍 Python服務原始響應:', {
      success: response.data.success,
      dataKeys: Object.keys(response.data.data || {}),
      defectsCount: response.data.data?.defects?.length || 0,
      summary: response.data.data?.summary
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Python服務檢測失敗');
    }

    console.log('✅ Python服務檢測完成');
    const detectionResult = response.data.data;

    // 🔧 詳細檢查 defects 數據
    console.log('🔍 檢查 defects 數據:', {
      defects: detectionResult.defects,
      defectsType: typeof detectionResult.defects,
      defectsIsArray: Array.isArray(detectionResult.defects),
      defectsLength: detectionResult.defects?.length
    });

    // 🛡️ 確保 defects 是有效數組
    const safeDefects = Array.isArray(detectionResult.defects) ? detectionResult.defects : [];

    if (safeDefects.length > 0) {
      console.log('✅ 找到瑕疵數據:');
      safeDefects.forEach((defect, index) => {
        console.log(`   ${index + 1}. ${defect.defectType}: ${defect.confidence}`);
      });
    } else {
      console.log('⚠️ defects 數組為空或無效');
    }

    // 🔧 處理結果格式，確保數據正確映射
    const processedDefects = safeDefects.map((defect, index) => ({
      id: defect.id || (index + 1),
      type: defect.defectType,  // 🔑 這裡是關鍵！使用 type 而不是 defectType
      defectType: defect.defectType,  // 保留原始字段作為備用
      classId: defect.classId || 0,
      confidence: defect.confidence || 0,
      box: {  // 🔑 前端期望的座標格式
        x: defect.xCenter || 0,
        y: defect.yCenter || 0,
        width: defect.width || 0,
        height: defect.height || 0
      },
      // 原始座標數據（備用）
      xCenter: defect.xCenter || 0,
      yCenter: defect.yCenter || 0,
      width: defect.width || 0,
      height: defect.height || 0,
      // 🔑 處理縮圖數據：如果 Python 服務提供了 base64 縮圖，直接使用
      thumbnail: defect.thumbnail ? `data:image/jpeg;base64,${defect.thumbnail}` : null,
      description: getDefectDescription(defect.defectType),
      recommendation: getDefectRecommendation(defect.defectType),
      severity: getDefectSeverity(defect.defectType),
      chineseName: getDefectChineseName(defect.defectType)
    }));

    const detectionTime = Date.now() - startTime;
    console.log(`⏱️ 檢測耗時: ${detectionTime}ms`);

    // 🔧 處理圖片數據
    let resultImageBuffer = null;
    if (detectionResult.resultImage) {
      try {
        const resultImageBase64 = detectionResult.resultImage.split(',')[1] || detectionResult.resultImage;
        resultImageBuffer = Buffer.from(resultImageBase64, 'base64');
        console.log('✅ 成功處理結果圖片，大小:', resultImageBuffer.length, 'bytes');
      } catch (imgError) {
        console.error('❌ 處理結果圖片失敗:', imgError);
        resultImageBuffer = imageBuffer; // 使用原圖作為後備
      }
    } else {
      console.log('⚠️ 沒有結果圖片，使用原圖');
      resultImageBuffer = imageBuffer;
    }

    // 🔧 構建最終結果
    const finalResult = {
      defects: processedDefects,
      defectCount: processedDefects.length,
      averageConfidence: processedDefects.length > 0
        ? processedDefects.reduce((sum, d) => sum + d.confidence, 0) / processedDefects.length
        : 0,
      resultImage: resultImageBuffer,
      detectionTime,
      usedConfig: detectionResult.usedConfig || {
        confidenceThreshold,
        modelVersion: 'v1.0',
        imageSize: 640
      }
    };

    console.log('🎯 最終結果統計:', {
      defectCount: finalResult.defectCount,
      averageConfidence: finalResult.averageConfidence,
      hasResultImage: !!finalResult.resultImage,
      resultImageSize: finalResult.resultImage?.length,
      defectsWithThumbnails: processedDefects.filter(d => d.thumbnail).length
    });

    return finalResult;

  } catch (error) {
    console.error('❌ 模型執行失敗:', error.message);

    // 更詳細的錯誤分析
    if (error.response && error.response.data) {
      console.error('Python服務錯誤詳情:', error.response.data);
      throw new Error(`Python服務錯誤: ${error.response.data.detail || error.message}`);
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('無法連接到Python檢測服務。請確保Python服務正在運行於端口8000');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('檢測服務響應超時。請檢查模型文件和服務狀態');
    } else {
      throw new Error('模型執行失敗: ' + error.message);
    }
  }
};

/**
 * 在原圖上標記檢測到的瑕疵
 * @param {Buffer} imageBuffer 原始圖像
 * @param {Array} defects 檢測到的瑕疵列表
 * @param {Object} metadata 圖像元數據
 */
export const drawDetections = async (imageBuffer, defects, metadata) => {
  try {
    // 獲取圖像尺寸
    const { width, height } = metadata || await sharp(imageBuffer).metadata();

    // 創建SVG覆蓋層
    const svgBoxes = defects.map(defect => {
      // 轉換相對座標為絕對像素座標
      const x = defect.xCenter * width;
      const y = defect.yCenter * height;
      const boxWidth = defect.width * width;
      const boxHeight = defect.height * height;

      // 根據瑕疵類型選擇顏色
      let color;
      switch (defect.defectType) {
        case 'missing_hole': color = 'blue'; break;
        case 'mouse_bite': color = 'green'; break;
        case 'open_circuit': color = 'red'; break;
        case 'short': color = 'yellow'; break;
        case 'spur': color = 'purple'; break;
        case 'spurious_copper': color = 'pink'; break;
        default: color = 'white';
      }

      // 創建矩形框和標籤
      return `
        <rect
          x="${x - boxWidth / 2}"
          y="${y - boxHeight / 2}"
          width="${boxWidth}"
          height="${boxHeight}"
          fill="none"
          stroke="${color}"
          stroke-width="3"
          stroke-opacity="0.8"
        />
        <rect
          x="${x - boxWidth / 2}"
          y="${y - boxHeight / 2 - 20}"
          width="${boxWidth}"
          height="20"
          fill="${color}"
          fill-opacity="0.7"
        />
        <text
          x="${x - boxWidth / 2 + 5}"
          y="${y - boxHeight / 2 - 5}"
          font-family="Arial"
          font-size="12"
          fill="white"
        >
          ${defect.defectType} ${(defect.confidence * 100).toFixed(0)}%
        </text>
      `;
    }).join('');

    const svgImage = `
      <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
        ${svgBoxes}
      </svg>
    `;

    // 將SVG覆蓋在原圖上
    const resultBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgImage),
          top: 0,
          left: 0
        }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    return resultBuffer;
  } catch (error) {
    console.error('繪製檢測結果失敗:', error);
    // 如果失敗，返回原圖
    return imageBuffer;
  }
};

/**
 * 為瑕疵區域創建縮圖
 * @param {Buffer} imageBuffer 原始圖像
 * @param {Object} defect 瑕疵詳情
 * @param {Object} metadata 圖像元數據
 */
export const createDefectThumbnail = async (imageBuffer, defect, metadata) => {
  try {
    // 獲取圖像尺寸
    const { width, height } = metadata || await sharp(imageBuffer).metadata();

    // 計算裁剪區域 (略大於檢測框以包含上下文)
    const boxWidth = defect.width * width;
    const boxHeight = defect.height * height;

    const cropLeft = Math.max(0, Math.round((defect.xCenter * width) - boxWidth * 0.7));
    const cropTop = Math.max(0, Math.round((defect.yCenter * height) - boxHeight * 0.7));
    const cropWidth = Math.min(width - cropLeft, Math.round(boxWidth * 1.4));
    const cropHeight = Math.min(height - cropTop, Math.round(boxHeight * 1.4));

    // 裁剪和調整大小
    const thumbnail = await sharp(imageBuffer)
      .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();

    return thumbnail;
  } catch (error) {
    console.error('創建瑕疵縮圖失敗:', error);
    return null;
  }
};
