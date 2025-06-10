import fs from 'fs';
import path from 'path';
import * as onnx from 'onnxruntime-node';
import sharp from 'sharp';
import { DetectionModel } from '../model/detectionHistoryModel.js';
import float16 from 'float16';

// 定義類別名稱 (從data.yaml中獲取)
const CLASS_NAMES = ['missing_hole', 'mouse_bite', 'open_circuit', 'short', 'spur', 'spurious_copper'];

/**
 * 從數據庫中獲取活躍的模型
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
 * 使用ONNX運行YOLO模型進行檢測
 * @param {Buffer} imageBuffer 原始圖像數據
 * @param {number} confidenceThreshold 置信度閾值
 */
export const runDetection = async (imageBuffer, confidenceThreshold = 0.5) => {
  try {
    // 記錄開始時間
    const startTime = Date.now();
    console.log('開始檢測，置信度閾值:', confidenceThreshold);

    // 嘗試從數據庫獲取模型
    let modelBuffer;
    try {
      const modelRecord = await getActiveModel();
      // 解析相對路徑為絕對路徑
      const modelRelativePath = modelRecord.modelFile;
      const modelAbsolutePath = path.resolve(process.cwd(), modelRelativePath);
      console.log('從資料庫找到模型路徑:', modelRelativePath);
      console.log('從檔案系統讀取模型:', modelAbsolutePath);

      if (!fs.existsSync(modelAbsolutePath)) {
        throw new Error('模型文件不存在: ' + modelAbsolutePath);
      }

      modelBuffer = fs.readFileSync(modelAbsolutePath);
    } catch (dbError) {
      console.warn('從數據庫獲取模型失敗，嘗試使用本地文件:', dbError);

      // 如果數據庫沒有模型，使用本地文件
      const modelPath = path.join(process.cwd(), 'model', 'best.onnx');
      if (!fs.existsSync(modelPath)) {
        throw new Error('找不到模型文件: ' + modelPath);
      }
      modelBuffer = fs.readFileSync(modelPath);
    }

    // 建立ONNX會話
    const session = await onnx.InferenceSession.create(modelBuffer);

    // 預處理圖像
    const { tensor, originalDims, metadata } = await preprocessImage(imageBuffer);

    // 將Float32Array轉換為Uint16Array (float16格式)
    console.log('轉換tensor為float16格式');
    const tensor32 = tensor; // 原始的Float32Array
    const tensor16Buffer = float16.toArrayBuffer(tensor32);
    const tensor16 = new Uint16Array(tensor16Buffer);
    console.log('轉換完成，tensor16長度:', tensor16.length);

    // 準備輸入張量 - 注意YOLO需要NCHW格式 [1, 3, 640, 640]
    const inputTensor = new onnx.Tensor('float16', tensor, [1, 3, 640, 640]);

    // 獲取輸入名稱 (通常是 'images')
    const inputNames = session.inputNames;
    const outputNames = session.outputNames;

    console.log('Model input names:', inputNames);
    console.log('Model output names:', outputNames);

    // 動態創建feeds對象
    const feeds = {};
    feeds[inputNames[0]] = inputTensor;

    // 運行推理
    console.log('Running inference...');
    const results = await session.run(feeds);
    console.log('Inference complete');

    // 處理輸出 - 獲取第一個輸出張量
    const outputTensor = results[outputNames[0]];

    // 整理檢測結果
    const defects = [];
    let totalConfidence = 0;

    // YOLOv5/v8輸出格式處理: [1, num_detections, 6]或[1, num_detections, 7]
    // 每行是: [x, y, w, h, confidence, class_id] 或 [x, y, w, h, confidence, class_id, class_conf]
    const outputData = outputTensor.data;
    const outputShape = outputTensor.dims;

    console.log('Output shape:', outputShape);

    // 根據輸出張量形狀動態處理
    let numDetections, detectionSize;

    // 判斷輸出格式
    if (outputShape.length === 3) {
      // [1, num_detections, 5+num_classes] 形式
      numDetections = outputShape[1];
      detectionSize = outputShape[2];

      for (let i = 0; i < numDetections; i++) {
        const baseIdx = i * detectionSize;

        // 解析坐標和置信度
        const xCenter = outputData[baseIdx + 0];
        const yCenter = outputData[baseIdx + 1];
        const width = outputData[baseIdx + 2];
        const height = outputData[baseIdx + 3];
        const confidence = outputData[baseIdx + 4];

        // 檢查置信度是否超過閾值
        if (confidence < confidenceThreshold) continue;

        // 查找最高類別置信度
        let maxClassScore = 0;
        let maxClassId = 0;

        for (let j = 0; j < CLASS_NAMES.length; j++) {
          const classScore = outputData[baseIdx + 5 + j];
          if (classScore > maxClassScore) {
            maxClassScore = classScore;
            maxClassId = j;
          }
        }

        // 只有類別置信度也足夠高時才加入結果
        if (maxClassScore > confidenceThreshold) {
          const totalScore = confidence * maxClassScore;

          defects.push({
            classId: maxClassId,
            defectType: CLASS_NAMES[maxClassId],
            xCenter,
            yCenter,
            width,
            height,
            confidence: totalScore
          });

          totalConfidence += totalScore;
        }
      }
    } else if (outputShape.length === 2 && outputShape[1] >= 6) {
      // [num_detections, 6/7] 形式 (已經過過濾的)
      numDetections = outputShape[0];
      detectionSize = outputShape[1];

      for (let i = 0; i < numDetections; i++) {
        const confidence = detectionSize >= 7 ?
          outputData[i * detectionSize + 4] * outputData[i * detectionSize + 5] : // conf * class_conf
          outputData[i * detectionSize + 4]; // 只有conf

        if (confidence < confidenceThreshold) continue;

        const classId = detectionSize >= 7 ?
          Math.round(outputData[i * detectionSize + 6]) : // 若有class_conf, class_id是第7個
          Math.round(outputData[i * detectionSize + 5]); // 若無class_conf, class_id是第6個

        if (classId >= 0 && classId < CLASS_NAMES.length) {
          defects.push({
            classId,
            defectType: CLASS_NAMES[classId],
            xCenter: outputData[i * detectionSize + 0],
            yCenter: outputData[i * detectionSize + 1],
            width: outputData[i * detectionSize + 2],
            height: outputData[i * detectionSize + 3],
            confidence
          });

          totalConfidence += confidence;
        }
      }
    } else {
      console.error('不支持的輸出格式:', outputShape);
      throw new Error('模型輸出格式不支持');
    }

    // 計算平均置信度
    const averageConfidence = defects.length > 0 ? totalConfidence / defects.length : 0;

    // 生成標記後的圖像
    const resultImage = await drawDetections(imageBuffer, defects, metadata);

    // 為每個瑕疵生成縮圖
    const defectsWithThumbnails = await Promise.all(
      defects.map(async (defect, index) => {
        const thumbnail = await createDefectThumbnail(imageBuffer, defect, metadata);
        return {
          ...defect,
          id: index + 1, // 添加唯一ID
          thumbnail
        };
      })
    );

    // 計算檢測時間
    const detectionTime = Date.now() - startTime;

    return {
      defects: defectsWithThumbnails,
      defectCount: defects.length,
      averageConfidence,
      resultImage,
      detectionTime
    };
  } catch (error) {
    console.error('模型執行失敗:', error);
    throw new Error('模型執行失敗: ' + error.message);
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
