import sequelize from '../config/database.js';
import { Op } from 'sequelize';
import { DetectionHistory, DefectDetail, DetectionModel } from '../model/detectionHistoryModel.js';
import { runDetection } from '../utils/modelUtils.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';

/**
 * 處理PCB圖像瑕疵檢測
 */
export const detectDefects = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '請上傳PCB圖像'
      });
    }

    const confidenceThreshold = parseFloat(req.body.confidenceThreshold) || 0.5;
    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;

    console.log('🔍 開始檢測處理，置信度:', confidenceThreshold);

    // 🔧 詳細檢查用戶認證狀態
    console.log('🔒 用戶認證檢查:', {
      hasReqUser: !!req.user,
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      cookies: req.cookies,
      headers: {
        authorization: req.headers.authorization,
        cookie: req.headers.cookie
      }
    });

    // 執行檢測 (調用Python服務)
    const detectionResult = await runDetection(imageBuffer, confidenceThreshold);

    console.log('🔍 檢測結果處理:', {
      defectCount: detectionResult.defectCount,
      defectsLength: detectionResult.defects?.length,
      hasResultImage: !!detectionResult.resultImage
    });

    const userId = req.user?.id;
    console.log('👤 用戶ID提取結果:', userId);

    // 保存檢測記錄 (如果用戶已登入)
    let savedHistory = null;
    if (userId) {
      try {
        console.log('💾 開始保存檢測歷史...');

        // 🔧 詳細的保存過程日誌
        console.log('💾 準備保存的數據:', {
          userId,
          originalImageSize: imageBuffer.length,
          originalImageType: imageType,
          resultImageSize: detectionResult.resultImage?.length,
          defectCount: detectionResult.defectCount,
          averageConfidence: detectionResult.averageConfidence,
          detectionTime: detectionResult.detectionTime
        });

        savedHistory = await DetectionHistory.create({
          userId,
          originalImage: imageBuffer,
          originalImageType: imageType,
          resultImage: detectionResult.resultImage,
          defectCount: detectionResult.defectCount,
          averageConfidence: detectionResult.averageConfidence,
          detectionTime: detectionResult.detectionTime
        });

        console.log('✅ 檢測歷史主記錄已保存，ID:', savedHistory.id);

        // 保存瑕疵詳情
        for (const [index, defect] of detectionResult.defects.entries()) {
          let thumbnailBuffer = null;
          if (defect.thumbnail) {
            try {
              console.log(`🔍 處理第 ${index + 1} 個瑕疵縮圖:`, {
                defectType: defect.defectType,
                thumbnailLength: defect.thumbnail.length,
                startsWithData: defect.thumbnail.startsWith('data:'),
                thumbnailPrefix: defect.thumbnail.substring(0, 50)
              });

              // 如果已經包含 data: 前綴，則移除它
              let base64Data = defect.thumbnail;
              if (base64Data.startsWith('data:image/')) {
                base64Data = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
                console.log('🔧 移除 data: 前綴後長度:', base64Data.length);
              }

              thumbnailBuffer = Buffer.from(base64Data, 'base64');
              console.log('✅ 縮圖 Buffer 處理成功，大小:', thumbnailBuffer.length, 'bytes');
            } catch (thumbnailError) {
              console.error(`⚠️ 第 ${index + 1} 個瑕疵縮圖數據處理失敗:`, thumbnailError);
              thumbnailBuffer = null;
            }
          }

          const defectDetailData = {
            detectionId: savedHistory.id,
            defectType: defect.defectType,
            classId: defect.classId,
            xCenter: defect.xCenter,
            yCenter: defect.yCenter,
            width: defect.width,
            height: defect.height,
            confidence: defect.confidence,
            thumbnailImage: thumbnailBuffer
          };

          console.log(`💾 準備保存瑕疵詳情 ${index + 1}:`, {
            detectionId: defectDetailData.detectionId,
            defectType: defectDetailData.defectType,
            confidence: defectDetailData.confidence,
            hasThumbnail: !!defectDetailData.thumbnailImage,
            thumbnailSize: defectDetailData.thumbnailImage?.length
          });

          const defectDetail = await DefectDetail.create(defectDetailData);
          console.log(`✅ 瑕疵詳情 ${index + 1} 已保存，ID:`, defectDetail.id);
        }

        console.log('✅ 所有檢測數據已保存完成，主記錄ID:', savedHistory.id);
      } catch (saveError) {
        console.error('❌ 保存檢測歷史記錄失敗:', saveError);
        console.error('❌ 錯誤詳情:', saveError.stack);
        console.error('❌ 錯誤類型:', saveError.name);
        console.error('❌ 錯誤訊息:', saveError.message);

        // 檢查是否是資料庫連接問題
        if (saveError.name === 'SequelizeConnectionError') {
          console.error('❌ 資料庫連接錯誤');
        } else if (saveError.name === 'SequelizeValidationError') {
          console.error('❌ 資料驗證錯誤:', saveError.errors);
        }

        // 如果保存失敗，不影響返回檢測結果，但記錄錯誤
      }
    } else {
      console.log('⚠️ 用戶未登入，跳過保存步驟');
    }

    // 🔧 準備響應數據 - 確保格式正確
    const originalBase64 = `data:${imageType};base64,${imageBuffer.toString('base64')}`;
    const resultBase64 = `data:image/jpeg;base64,${detectionResult.resultImage.toString('base64')}`;

    // 處理瑕疵數據
    const processedDefects = detectionResult.defects.map((defect, index) => {
      let thumbnailUrl = null;
      if (defect.thumbnail) {
        if (defect.thumbnail.startsWith('data:image/')) {
          thumbnailUrl = defect.thumbnail;
        } else {
          thumbnailUrl = `data:image/jpeg;base64,${defect.thumbnail}`;
        }

        console.log(`🔍 為前端準備縮圖 ${index + 1}:`, {
          defectType: defect.defectType,
          originalLength: defect.thumbnail.length,
          finalUrlLength: thumbnailUrl.length,
          hasDataPrefix: thumbnailUrl.startsWith('data:image/')
        });
      }

      return {
        id: defect.id || (index + 1),
        type: defect.defectType,
        defectType: defect.defectType,
        classId: defect.classId || 0,
        confidence: defect.confidence || 0,
        box: {
          x: defect.xCenter || 0,
          y: defect.yCenter || 0,
          width: defect.width || 0,
          height: defect.height || 0
        },
        xCenter: defect.xCenter || 0,
        yCenter: defect.yCenter || 0,
        width: defect.width || 0,
        height: defect.height || 0,
        thumbnail: thumbnailUrl,
        description: getDefectDescription(defect.defectType),
        recommendation: getDefectRecommendation(defect.defectType)
      };
    });

    console.log('🎯 最終響應數據:', {
      defectsCount: processedDefects.length,
      totalDefects: detectionResult.defectCount,
      defectTypes: processedDefects.map(d => d.type),
      thumbnailCounts: processedDefects.filter(d => d.thumbnail).length,
      savedHistoryId: savedHistory?.id,
      hasUserId: !!userId
    });

    // 構建響應結構
    const responseData = {
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
    };

    console.log('🚀 最終發送給前端的響應:', {
      success: responseData.success,
      defectsCount: responseData.data.defects.length,
      hasOriginalImage: !!responseData.data.originalImage,
      hasResultImage: !!responseData.data.resultImage,
      summary: responseData.data.summary,
      defectsWithThumbnails: responseData.data.defects.filter(d => d.thumbnail).length,
      savedHistoryId: responseData.data.savedHistoryId
    });

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ 檢測失敗:', error);
    console.error('❌ 錯誤堆疊:', error.stack);
    return res.status(500).json({
      success: false,
      message: '檢測過程中發生錯誤: ' + error.message
    });
  }
};

/**
 * 獲取用戶的檢測歷史記錄 - 支援完整搜尋和篩選
 */
export const getUserDetectionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // 🔧 簡化：只保留基本篩選參數
    const {
      search = '',           // 搜尋關鍵字
      dateRange = '',        // 時間範圍
      defectType = '',       // 瑕疵類型
      hasDefects = '',       // 是否有瑕疵
      sortBy = 'createdAt',  // 排序欄位
      sortOrder = 'desc'     // 排序方向
    } = req.query;

    console.log('📋 搜尋參數:', {
      userId, page, limit, search, dateRange, defectType,
      hasDefects, sortBy, sortOrder
    });

    // 🔧 構建搜尋條件
    const whereConditions = { userId };

    // 🔍 文字搜尋條件（模糊搜尋檢測ID或創建時間）
    if (search && search.trim()) {
      const searchTerm = search.trim();

      // 如果搜尋內容是數字，搜尋ID
      if (/^\d+$/.test(searchTerm)) {
        whereConditions.id = {
          [Op.like]: `%${searchTerm}%`
        };
      } else {
        // 否則搜尋日期相關內容
        whereConditions[Op.or] = [
          sequelize.where(
            sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d'),
            { [Op.like]: `%${searchTerm}%` }
          ),
          sequelize.where(
            sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d %H:%i'),
            { [Op.like]: `%${searchTerm}%` }
          )
        ];
      }
    }

    // 🔧 時間範圍篩選
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          whereConditions.createdAt = {
            [Op.gte]: startDate
          };
          break;

        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          whereConditions.createdAt = {
            [Op.gte]: startDate
          };
          break;

        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          whereConditions.createdAt = {
            [Op.gte]: startDate
          };
          break;

        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          whereConditions.createdAt = {
            [Op.gte]: startDate
          };
          break;

        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          whereConditions.createdAt = {
            [Op.gte]: startDate
          };
          break;

        default:
          console.log('⚠️ 未知的時間範圍:', dateRange);
          break;
      }
    }

    // 🔧 瑕疵數量篩選
    if (hasDefects === 'true') {
      whereConditions.defectCount = { [Op.gt]: 0 };
    } else if (hasDefects === 'false') {
      whereConditions.defectCount = 0;
    }

    // 🔧 排序設定
    const orderBy = [];
    const validSortFields = ['createdAt', 'defectCount', 'averageConfidence', 'detectionTime'];
    const validSortOrders = ['asc', 'desc'];

    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      orderBy.push([sortBy, sortOrder.toUpperCase()]);
    } else {
      orderBy.push(['createdAt', 'DESC']); // 預設排序
    }

    console.log('🔍 最終搜尋條件:', whereConditions);
    console.log('📊 排序條件:', orderBy);

    // 🔧 執行查詢
    let { count, rows } = await DetectionHistory.findAndCountAll({
      where: whereConditions,
      order: orderBy,
      limit,
      offset,
      distinct: true
    });

    // 🔧 如果有瑕疵類型篩選，需要額外處理
    if (defectType && defectType.trim()) {
      console.log('🎯 應用瑕疵類型篩選:', defectType);

      // 獲取有指定瑕疵類型的檢測記錄ID
      const defectRecords = await DefectDetail.findAll({
        where: {
          defectType: defectType.trim(),
          detectionId: {
            [Op.in]: rows.map(row => row.id)
          }
        },
        attributes: ['detectionId'],
        group: ['detectionId']
      });

      const validDetectionIds = defectRecords.map(record => record.detectionId);
      rows = rows.filter(row => validDetectionIds.includes(row.id));

      // 重新計算總數
      if (validDetectionIds.length > 0) {
        count = await DetectionHistory.count({
          where: {
            ...whereConditions,
            id: { [Op.in]: validDetectionIds }
          },
          distinct: true
        });
      } else {
        count = 0;
      }
    }

    // 🔧 格式化結果並添加瑕疵類型信息
    const history = await Promise.all(rows.map(async (record) => {
      // 🔧 獲取該檢測記錄的瑕疵類型
      const defectTypes = await DefectDetail.findAll({
        where: { detectionId: record.id },
        attributes: ['defectType'],
        group: ['defectType']
      });

      const uniqueDefectTypes = [...new Set(defectTypes.map(d => d.defectType))];

      return {
        id: record.id,
        defectCount: record.defectCount,
        averageConfidence: record.averageConfidence,
        detectionTime: record.detectionTime,
        createdAt: record.createdAt,
        defectTypes: uniqueDefectTypes, // 🔧 添加瑕疵類型列表
        hasDefects: record.defectCount > 0,
        // 🔧 添加統計信息
        qualityStatus: record.defectCount === 0 ? 'good' : 'defective',
        confidenceLevel: record.averageConfidence >= 0.8 ? 'high' :
                        record.averageConfidence >= 0.6 ? 'medium' : 'low'
      };
    }));

    // 🔧 添加搜尋統計信息
    const searchStats = {
      totalRecords: count,
      currentPageRecords: history.length,
      hasFilters: !!(search || dateRange || defectType || hasDefects),
      appliedFilters: {
        search: search || null,
        dateRange: dateRange || null,
        defectType: defectType || null,
        hasDefects: hasDefects || null
      }
    };

    console.log('📊 搜尋統計:', searchStats);

    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        },
        searchStats, // 🔧 新增搜尋統計
        appliedFilters: searchStats.appliedFilters // 🔧 方便前端顯示已套用的篩選
      }
    });

  } catch (error) {
    console.error('❌ 獲取檢測歷史記錄失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取檢測歷史記錄失敗: ' + error.message
    });
  }
};

/**
 * 獲取可用的瑕疵類型列表（用於篩選選項）
 */
export const getAvailableDefectTypes = async (req, res) => {
  try {
    const userId = req.user?.id;

    console.log('📋 獲取可用瑕疵類型，用戶ID:', userId);

    let whereCondition = {};
    if (userId) {
      // 只獲取該用戶的瑕疵類型
      const userDetectionIds = await DetectionHistory.findAll({
        where: { userId },
        attributes: ['id']
      });

      whereCondition.detectionId = {
        [Op.in]: userDetectionIds.map(d => d.id)
      };
    }

    const defectTypes = await DefectDetail.findAll({
      where: whereCondition,
      attributes: [
        'defectType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['defectType'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    const formattedTypes = defectTypes.map(type => ({
      value: type.defectType,
      label: getDefectChineseName(type.defectType),
      count: parseInt(type.dataValues.count)
    }));

    console.log('✅ 瑕疵類型列表:', formattedTypes);

    return res.status(200).json({
      success: true,
      data: {
        defectTypes: formattedTypes,
        total: formattedTypes.length
      }
    });

  } catch (error) {
    console.error('❌ 獲取瑕疵類型失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取瑕疵類型失敗: ' + error.message
    });
  }
};

/**
 * 獲取搜尋建議（自動完成）
 */
export const getSearchSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { query = '', type = 'all' } = req.query;

    if (!query || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: { suggestions: [] }
      });
    }

    console.log('🔍 獲取搜尋建議:', { query, type, userId });

    const suggestions = [];

    // ID 建議
    if (type === 'all' || type === 'id') {
      if (/^\d+/.test(query)) {
        const idMatches = await DetectionHistory.findAll({
          where: {
            userId,
            id: { [Op.like]: `${query}%` }
          },
          attributes: ['id', 'createdAt'],
          limit: 5,
          order: [['id', 'ASC']]
        });

        idMatches.forEach(match => {
          suggestions.push({
            type: 'id',
            value: match.id.toString(),
            label: `檢測記錄 #${match.id}`,
            description: `建立於 ${new Date(match.createdAt).toLocaleDateString('zh-TW')}`
          });
        });
      }
    }

    // 日期建議
    if (type === 'all' || type === 'date') {
      const dateMatches = await DetectionHistory.findAll({
        where: {
          userId,
          [Op.or]: [
            sequelize.where(
              sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d'),
              { [Op.like]: `%${query}%` }
            )
          ]
        },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d'), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d')],
        limit: 5,
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m-%d'), 'DESC']]
      });

      dateMatches.forEach(match => {
        suggestions.push({
          type: 'date',
          value: match.dataValues.date,
          label: `日期：${match.dataValues.date}`,
          description: `${match.dataValues.count} 條記錄`
        });
      });
    }

    console.log('✅ 搜尋建議:', suggestions);

    return res.status(200).json({
      success: true,
      data: { suggestions: suggestions.slice(0, 10) } // 最多返回10條建議
    });

  } catch (error) {
    console.error('❌ 獲取搜尋建議失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取搜尋建議失敗: ' + error.message
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

    console.log('📄 查詢檢測詳情:', { detectionId, userId });

    // 🔧 修復：導入必要的模型
    const { DetectionHistory, DefectDetail } = await import('../model/detectionHistoryModel.js');
    const sequelize = (await import('../config/database.js')).default;

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

    console.log('✅ 找到檢測記錄:', {
      id: detectionRecord.id,
      defectCount: detectionRecord.defectCount,
      hasOriginalImage: !!detectionRecord.originalImage,
      hasResultImage: !!detectionRecord.resultImage,
      originalImageType: detectionRecord.originalImageType
    });

    // 查詢該記錄的所有瑕疵詳情
    const defectDetails = await DefectDetail.findAll({
      where: { detectionId },
      order: [['id', 'ASC']]
    });

    console.log('🔍 找到瑕疵詳情:', defectDetails.length, '條');

    // 🔧 修復：正確處理瑕疵詳情格式
    const defects = defectDetails.map((defect, index) => {
      // 處理縮圖數據
      let thumbnailBase64 = null;
      if (defect.thumbnailImage && defect.thumbnailImage.length > 0) {
        try {
          thumbnailBase64 = `data:image/jpeg;base64,${defect.thumbnailImage.toString('base64')}`;
        } catch (thumbError) {
          console.error('❌ 縮圖轉換失敗:', thumbError);
        }
      }

      return {
        id: defect.id,
        type: defect.defectType, // 🔑 重要：前端期望的字段名
        defectType: defect.defectType,
        classId: defect.classId,
        confidence: defect.confidence,
        // 🔑 修復：確保box格式正確
        box: {
          x: defect.xCenter,
          y: defect.yCenter,
          width: defect.width,
          height: defect.height
        },
        // 原始座標數據
        xCenter: defect.xCenter,
        yCenter: defect.yCenter,
        width: defect.width,
        height: defect.height,
        thumbnail: thumbnailBase64,
        description: getDefectDescription(defect.defectType),
        recommendation: getDefectRecommendation(defect.defectType)
      };
    });

    // 🔧 修復：確保圖像數據正確處理
    let originalImageBase64 = null;
    let resultImageBase64 = null;

    try {
      if (detectionRecord.originalImage && detectionRecord.originalImage.length > 0) {
        const imageType = detectionRecord.originalImageType || 'image/jpeg';
        originalImageBase64 = `data:${imageType};base64,${detectionRecord.originalImage.toString('base64')}`;
        console.log('✅ 原始圖像轉換成功');
      }

      if (detectionRecord.resultImage && detectionRecord.resultImage.length > 0) {
        resultImageBase64 = `data:image/jpeg;base64,${detectionRecord.resultImage.toString('base64')}`;
        console.log('✅ 結果圖像轉換成功');
      }
    } catch (imageError) {
      console.error('❌ 圖像數據轉換失敗:', imageError);
    }

    // 🔧 修復：確保響應格式與前端期望一致
    const responseData = {
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
        createdAt: detectionRecord.createdAt,
        // 🔑 添加前端可能需要的額外字段
        status: 'completed',
        hasDefects: detectionRecord.defectCount > 0
      }
    };

    console.log('🚀 響應數據準備完成:', {
      defectsCount: defects.length,
      hasOriginalImage: !!originalImageBase64,
      hasResultImage: !!resultImageBase64,
      defectsWithThumbnails: defects.filter(d => d.thumbnail).length
    });

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('❌ 獲取檢測詳情失敗:', error);
    console.error('❌ 錯誤堆疊:', error.stack);
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
 * 匯出單次檢測結果為ZIP文件
 */
export const exportDetectionResult = async (req, res) => {
  try {
    const { results } = req.body;

    if (!results) {
      return res.status(400).json({
        success: false,
        message: '沒有檢測結果可供匯出'
      });
    }

    console.log('📁 開始匯出檢測結果...');

    // 創建臨時目錄
    const tempId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp', 'exports', tempId);
    const resultsDir = path.join(tempDir, 'results', 'predict');
    const labelsDir = path.join(resultsDir, 'labels');

    // 確保目錄存在
    fs.mkdirSync(labelsDir, { recursive: true });

    // 1. 保存結果圖片
    if (results.resultImage) {
      try {
        // 移除 data:image/jpeg;base64, 前綴
        const base64Data = results.resultImage.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const outputImagePath = path.join(resultsDir, 'output.jpg');
        fs.writeFileSync(outputImagePath, imageBuffer);
        console.log('✅ 結果圖片已保存:', outputImagePath);
      } catch (imgError) {
        console.error('❌ 保存結果圖片失敗:', imgError);
      }
    }

    // 2. 生成標籤文件
    if (results.defects && Array.isArray(results.defects) && results.defects.length > 0) {
      const labelLines = results.defects.map(defect => {
        // 格式: class_id x_center y_center width height confidence
        const classId = defect.classId || 0;
        const xCenter = defect.xCenter || defect.box?.x || 0;
        const yCenter = defect.yCenter || defect.box?.y || 0;
        const width = defect.width || defect.box?.width || 0;
        const height = defect.height || defect.box?.height || 0;
        const confidence = defect.confidence || 0;

        return `${classId} ${xCenter} ${yCenter} ${width} ${height} ${confidence}`;
      });

      const labelContent = labelLines.join('\n');
      const labelPath = path.join(labelsDir, 'input.txt');
      fs.writeFileSync(labelPath, labelContent, 'utf8');
      console.log('✅ 標籤文件已保存:', labelPath);
      console.log('📝 標籤內容:', labelContent);
    } else {
      // 如果沒有瑕疵，創建空的標籤文件
      const labelPath = path.join(labelsDir, 'input.txt');
      fs.writeFileSync(labelPath, '', 'utf8');
      console.log('✅ 空標籤文件已保存:', labelPath);
    }

    // 3. 創建ZIP文件
    const zipFileName = `detection_result_${Date.now()}.zip`;
    const zipPath = path.join(tempDir, zipFileName);

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log('✅ ZIP文件創建完成，大小:', archive.pointer(), 'bytes');
        resolve();
      });

      archive.on('error', (err) => {
        console.error('❌ ZIP創建失敗:', err);
        reject(err);
      });

      archive.pipe(output);

      // 添加整個 results/predict 目錄到ZIP
      archive.directory(resultsDir, 'results/predict');
      archive.finalize();
    });

    // 4. 發送ZIP文件
    const zipStats = fs.statSync(zipPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.setHeader('Content-Length', zipStats.size);

    const zipStream = fs.createReadStream(zipPath);
    zipStream.pipe(res);

    // 清理臨時文件（在流結束後）
    zipStream.on('end', () => {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log('🧹 臨時文件已清理:', tempDir);
        } catch (cleanupError) {
          console.error('⚠️ 清理臨時文件失敗:', cleanupError);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('❌ 匯出檢測結果失敗:', error);
    return res.status(500).json({
      success: false,
      message: '匯出失敗: ' + error.message
    });
  }
};

/**
 * 從資料庫匯出歷史檢測結果
 */
export const exportHistoryDetectionResult = async (req, res) => {
  try {
    const detectionId = req.params.id;
    const userId = req.user?.id;

    console.log('📁 開始匯出歷史檢測結果:', detectionId);

    // 查詢檢測記錄
    const detectionRecord = await DetectionHistory.findOne({
      where: {
        id: detectionId,
        ...(userId && { userId }) // 如果有用戶ID，則限制只能匯出自己的記錄
      }
    });

    if (!detectionRecord) {
      return res.status(404).json({
        success: false,
        message: '檢測記錄不存在或您無權訪問'
      });
    }

    // 查詢瑕疵詳情
    const defectDetails = await DefectDetail.findAll({
      where: { detectionId }
    });

    console.log('📊 找到檢測記錄:', {
      id: detectionRecord.id,
      defectCount: detectionRecord.defectCount,
      defectDetailsCount: defectDetails.length,
      createdAt: detectionRecord.createdAt
    });

    // 創建臨時目錄
    const tempId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp', 'exports', tempId);
    const resultsDir = path.join(tempDir, 'results', 'predict');
    const labelsDir = path.join(resultsDir, 'labels');

    // 確保目錄存在
    fs.mkdirSync(labelsDir, { recursive: true });

    // 1. 保存結果圖片
    if (detectionRecord.resultImage) {
      try {
        const outputImagePath = path.join(resultsDir, 'output.jpg');
        fs.writeFileSync(outputImagePath, detectionRecord.resultImage);
        console.log('✅ 結果圖片已保存:', outputImagePath);
      } catch (imgError) {
        console.error('❌ 保存結果圖片失敗:', imgError);
      }
    }

    // 2. 生成標籤文件
    if (defectDetails.length > 0) {
      const labelLines = defectDetails.map(defect => {
        // 格式: class_id x_center y_center width height confidence
        return `${defect.classId} ${defect.xCenter} ${defect.yCenter} ${defect.width} ${defect.height} ${defect.confidence}`;
      });

      const labelContent = labelLines.join('\n');
      const labelPath = path.join(labelsDir, 'input.txt');
      fs.writeFileSync(labelPath, labelContent, 'utf8');
      console.log('✅ 標籤文件已保存:', labelPath);
      console.log('📝 標籤內容:', labelContent);
    } else {
      // 如果沒有瑕疵，創建空的標籤文件
      const labelPath = path.join(labelsDir, 'input.txt');
      fs.writeFileSync(labelPath, '', 'utf8');
      console.log('✅ 空標籤文件已保存:', labelPath);
    }

    // 3. 創建ZIP文件
    const formatDate = new Date(detectionRecord.createdAt).toISOString().slice(0, 19).replace(/:/g, '-');
    const zipFileName = `detection_result_${detectionId}_${formatDate}.zip`;
    const zipPath = path.join(tempDir, zipFileName);

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log('✅ ZIP文件創建完成，大小:', archive.pointer(), 'bytes');
        resolve();
      });

      archive.on('error', (err) => {
        console.error('❌ ZIP創建失敗:', err);
        reject(err);
      });

      archive.pipe(output);

      // 添加整個 results/predict 目錄到ZIP
      archive.directory(resultsDir, 'results/predict');
      archive.finalize();
    });

    // 4. 發送ZIP文件
    const zipStats = fs.statSync(zipPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.setHeader('Content-Length', zipStats.size);

    const zipStream = fs.createReadStream(zipPath);
    zipStream.pipe(res);

    // 清理臨時文件（在流結束後）
    zipStream.on('end', () => {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log('🧹 臨時文件已清理:', tempDir);
        } catch (cleanupError) {
          console.error('⚠️ 清理臨時文件失敗:', cleanupError);
        }
      }, 1000);
    });

  } catch (error) {
    console.error('❌ 匯出歷史檢測結果失敗:', error);
    return res.status(500).json({
      success: false,
      message: '匯出失敗: ' + error.message
    });
  }
};

/**
 * 批量匯出檢測結果 - 合成版本
 */
export const exportBatchDetectionResults = async (req, res) => {
  try {
    const { detectionIds } = req.body;
    const userId = req.user?.id;

    if (!detectionIds || !Array.isArray(detectionIds) || detectionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '請提供要匯出的檢測記錄ID'
      });
    }

    console.log('📁 開始批量匯出檢測結果:', detectionIds);

    // 🔧 導入必要的模型
    const { DetectionHistory, DefectDetail } = await import('../model/detectionHistoryModel.js');

    // 創建臨時目錄
    const tempId = uuidv4();
    const tempDir = path.join(process.cwd(), 'temp', 'exports', tempId);
    const batchDir = path.join(tempDir, 'batch_detection_results');

    // 確保目錄存在
    fs.mkdirSync(batchDir, { recursive: true });

    const exportResults = [];
    let successCount = 0;
    let failCount = 0;

    // 逐一處理每個檢測記錄
    for (let i = 0; i < detectionIds.length; i++) {
      const detectionId = detectionIds[i];

      try {
        console.log(`📄 處理檢測記錄 ${i + 1}/${detectionIds.length}: ${detectionId}`);

        // 查詢檢測記錄
        const detectionRecord = await DetectionHistory.findOne({
          where: {
            id: detectionId,
            ...(userId && { userId })
          }
        });

        if (!detectionRecord) {
          console.warn(`⚠️ 檢測記錄 ${detectionId} 不存在或無權訪問`);
          exportResults.push({
            detectionId,
            success: false,
            message: '檢測記錄不存在或無權訪問'
          });
          failCount++;
          continue;
        }

        // 查詢瑕疵詳情
        const defectDetails = await DefectDetail.findAll({
          where: { detectionId }
        });

        // 🔧 為每個檢測記錄創建獨立的子目錄
        const recordDir = path.join(batchDir, `detection_${detectionId}`);
        const resultsDir = path.join(recordDir, 'results', 'predict');
        const labelsDir = path.join(resultsDir, 'labels');

        // 確保目錄存在
        fs.mkdirSync(labelsDir, { recursive: true });

        // 保存檢測信息文件
        const infoFile = path.join(recordDir, 'detection_info.json');
        const detectionInfo = {
          id: detectionRecord.id,
          detectionTime: detectionRecord.detectionTime,
          defectCount: detectionRecord.defectCount,
          averageConfidence: detectionRecord.averageConfidence,
          createdAt: detectionRecord.createdAt,
          defectTypes: [...new Set(defectDetails.map(d => d.defectType))]
        };
        fs.writeFileSync(infoFile, JSON.stringify(detectionInfo, null, 2), 'utf8');

        // 1. 保存結果圖片
        if (detectionRecord.resultImage) {
          try {
            const resultImagePath = path.join(resultsDir, 'result_image.jpg');
            fs.writeFileSync(resultImagePath, detectionRecord.resultImage);
            console.log(`✅ 結果圖片已保存: ${resultImagePath}`);
          } catch (imgError) {
            console.error(`❌ 保存結果圖片失敗 (${detectionId}):`, imgError);
          }
        }

        // 2. 保存原始圖片
        if (detectionRecord.originalImage) {
          try {
            const originalImagePath = path.join(recordDir, 'original_image.jpg');
            fs.writeFileSync(originalImagePath, detectionRecord.originalImage);
            console.log(`✅ 原始圖片已保存: ${originalImagePath}`);
          } catch (imgError) {
            console.error(`❌ 保存原始圖片失敗 (${detectionId}):`, imgError);
          }
        }

        // 3. 生成標籤文件
        if (defectDetails.length > 0) {
          const labelLines = defectDetails.map(defect => {
            return `${defect.classId} ${defect.xCenter} ${defect.yCenter} ${defect.width} ${defect.height} ${defect.confidence}`;
          });

          const labelContent = labelLines.join('\n');
          const labelPath = path.join(labelsDir, 'labels.txt');
          fs.writeFileSync(labelPath, labelContent, 'utf8');
          console.log(`✅ 標籤文件已保存: ${labelPath} (${defectDetails.length} 個瑕疵)`);
        } else {
          // 創建空的標籤文件
          const labelPath = path.join(labelsDir, 'labels.txt');
          fs.writeFileSync(labelPath, '', 'utf8');
          console.log(`✅ 空標籤文件已創建: ${labelPath}`);
        }

        exportResults.push({
          detectionId,
          success: true,
          message: '匯出成功'
        });
        successCount++;

      } catch (recordError) {
        console.error(`❌ 處理檢測記錄 ${detectionId} 失敗:`, recordError);
        exportResults.push({
          detectionId,
          success: false,
          message: recordError.message
        });
        failCount++;
      }
    }

    // 4. 創建批量匯出摘要
    const summaryFile = path.join(batchDir, 'export_summary.json');
    const exportSummary = {
      exportTime: new Date().toISOString(),
      totalRecords: detectionIds.length,
      successCount,
      failCount,
      results: exportResults
    };
    fs.writeFileSync(summaryFile, JSON.stringify(exportSummary, null, 2), 'utf8');

    // 5. 創建ZIP文件
    const zipFileName = `batch_detection_results_${Date.now()}.zip`;
    const zipPath = path.join(tempDir, zipFileName);

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log(`✅ ZIP文件創建完成: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('❌ 創建ZIP文件失敗:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(batchDir, false); // 🔑 將整個批量目錄打包
      archive.finalize();
    });

    // 6. 發送ZIP文件
    const zipStats = fs.statSync(zipPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.setHeader('Content-Length', zipStats.size);

    const zipStream = fs.createReadStream(zipPath);
    zipStream.pipe(res);

    // 清理臨時文件（在流結束後）
    zipStream.on('end', () => {
      setTimeout(() => {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log('🧹 臨時文件已清理');
        } catch (cleanupError) {
          console.error('⚠️ 清理臨時文件失敗:', cleanupError);
        }
      }, 5000); // 5秒後清理
    });

    console.log(`🚀 批量匯出完成: 成功 ${successCount}，失敗 ${failCount}`);

  } catch (error) {
    console.error('❌ 批量匯出檢測結果失敗:', error);
    return res.status(500).json({
      success: false,
      message: '批量匯出失敗: ' + error.message
    });
  }
};

/**
 * 獲取用戶檢測統計數據
 */
export const getUserDetectionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📊 獲取用戶檢測統計數據，用戶ID:', userId);

    // 獲取當前年月，用於計算本月數據
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript月份從0開始，所以+1

    // 計算本月的開始和結束日期
    const monthStart = new Date(currentYear, currentMonth - 1, 1); // 本月1號
    const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59); // 本月最後一天的最後一秒

    console.log('📅 本月時間範圍:', {
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString()
    });

    // 1. 總檢測次數
    const totalDetections = await DetectionHistory.count({
      where: { userId }
    });

    // 2. 本月檢測次數
    const { Op } = (await import('sequelize')).default;
    const monthlyDetections = await DetectionHistory.count({
      where: {
        userId,
        createdAt: {
          [Op.between]: [monthStart, monthEnd]
        }
      }
    });

    // 3. 總瑕疵數量（所有時間）
    const totalDefectsResult = await DetectionHistory.sum('defectCount', {
      where: { userId }
    });
    const totalDefects = totalDefectsResult || 0;

    // 4. 本月瑕疵數量
    const monthlyDefectsResult = await DetectionHistory.sum('defectCount', {
      where: {
        userId,
        createdAt: {
          [Op.between]: [monthStart, monthEnd]
        }
      }
    });
    const monthlyDefects = monthlyDefectsResult || 0;

    // 5. 平均置信度（所有時間）
    const avgConfidenceResult = await DetectionHistory.findOne({
      where: { userId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('averageConfidence')), 'avgConfidence']
      ],
      raw: true
    });
    const averageConfidence = avgConfidenceResult?.avgConfidence || 0;

    // 6. 本月平均檢測時間
    const avgDetectionTimeResult = await DetectionHistory.findOne({
      where: {
        userId,
        createdAt: {
          [Op.between]: [monthStart, monthEnd]
        }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('detectionTime')), 'avgTime']
      ],
      raw: true
    });
    const averageDetectionTime = avgDetectionTimeResult?.avgTime || 0;

    // 7. 有瑕疵的檢測次數（質量率計算用）
    const defectiveDetections = await DetectionHistory.count({
      where: {
        userId,
        defectCount: {
          [Op.gt]: 0
        }
      }
    });

    // 8. 最近7天的檢測趨勢
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentDetections = await DetectionHistory.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: weekAgo
        }
      }
    });

    // 計算質量率（無瑕疵檢測 / 總檢測）
    const qualityRate = totalDetections > 0
      ? ((totalDetections - defectiveDetections) / totalDetections * 100).toFixed(1)
      : 100;

    const statsData = {
      totalDetections,
      monthlyDetections,
      totalDefects,
      monthlyDefects,
      averageConfidence: parseFloat((averageConfidence * 100).toFixed(2)), // 轉換為百分比
      averageDetectionTime: Math.round(averageDetectionTime),
      qualityRate: parseFloat(qualityRate),
      recentDetections,
      defectiveDetections,
      currentMonth: currentMonth,
      currentYear: currentYear
    };

    console.log('✅ 用戶統計數據:', statsData);

    return res.status(200).json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('❌ 獲取用戶統計數據失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取統計數據失敗: ' + error.message
    });
  }
};

/**
 * 獲取全系統統計數據（管理員用）
 */
export const getSystemStats = async (req, res) => {
  try {
    console.log('📊 獲取全系統統計數據');

    // 🔧 導入必要的模型和函數
    const { DetectionHistory, DefectDetail } = await import('../model/detectionHistoryModel.js');
    const User = (await import('../model/userModel.js')).default;
    const sequelize = (await import('../config/database.js')).default;

    // 🔧 並行獲取各種統計數據
    const [
      totalInspections,
      totalDefects,
      totalUsers,
      weeklyInspections,
      monthlyInspections,
      avgConfidence,
      defectsByType,
      recentActivity,
      defectiveInspections // 🔧 新增：有瑕疵的檢測次數
    ] = await Promise.all([
      // 1. 總檢測次數
      DetectionHistory.count(),

      // 2. 總瑕疵數量
      DefectDetail.count(),

      // 3. 總用戶數（活躍用戶）
      User.count({ where: { active: true } }),

      // 4. 本週檢測次數
      DetectionHistory.count({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // 5. 本月檢測次數
      DetectionHistory.count({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // 6. 平均置信度
      DetectionHistory.findOne({
        attributes: [
          [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.col('averageConfidence')), 'avgConfidence']
        ]
      }),

      // 7. 各類型瑕疵統計
      DefectDetail.findAll({
        attributes: [
          'defectType',
          [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'count']
        ],
        group: ['defectType'],
        order: [[sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('id')), 'DESC']],
        limit: 6
      }),

      // 8. 最近活動（最近24小時的檢測）
      DetectionHistory.count({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // 🔧 9. 有瑕疵的檢測次數（用於計算瑕疵率）
      DetectionHistory.count({
        where: {
          defectCount: {
            [sequelize.Sequelize.Op.gt]: 0
          }
        }
      })
    ]);

    // 🔧 修復：計算正確的統計指標
    const avgConfidenceValue = avgConfidence?.dataValues?.avgConfidence || 0;

    // 🔑 修復瑕疵率計算：應該是「有瑕疵的檢測次數 / 總檢測次數」
    const defectRate = totalInspections > 0
      ? Number(((defectiveInspections / totalInspections) * 100).toFixed(1))
      : 0;

    // 🔑 修復品質通過率計算：無瑕疵檢測 / 總檢測
    const qualityRate = totalInspections > 0
      ? Number(((totalInspections - defectiveInspections) / totalInspections * 100).toFixed(1))
      : 100;

    // 🔑 修復平均置信度：確保以百分比形式返回
    const averageConfidence = Number((avgConfidenceValue * 100).toFixed(1));

    // 🔧 處理瑕疵類型統計
    const defectTypeStats = defectsByType.map(item => ({
      type: item.defectType,
      count: parseInt(item.dataValues.count),
      percentage: totalDefects > 0 ? Number((parseInt(item.dataValues.count) / totalDefects * 100).toFixed(1)) : 0
    }));

    // 🔧 獲取趨勢數據（最近7天）
    const trendData = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        const dayInspections = await DetectionHistory.count({
          where: {
            createdAt: {
              [sequelize.Sequelize.Op.gte]: startOfDay,
              [sequelize.Sequelize.Op.lt]: endOfDay
            }
          }
        });

        return {
          date: startOfDay.toISOString().split('T')[0],
          inspections: dayInspections
        };
      })
    );

    // 🔑 計算月增長率（如果有足夠數據）
    const monthlyGrowth = weeklyInspections > 0 && monthlyInspections > weeklyInspections * 4
      ? Number(((monthlyInspections - weeklyInspections * 4) / (weeklyInspections * 4) * 100).toFixed(1))
      : 0;

    // 🔧 構建響應數據
    const systemStats = {
      // 基礎統計
      totalInspections,
      totalDefects,
      totalUsers,
      weeklyInspections,
      monthlyInspections,
      recentActivity, // 24小時內活動
      defectiveInspections, // 🔧 新增：有瑕疵的檢測次數

      // 🔑 修復後的品質指標
      averageConfidence, // 已經是百分比 (0-100)
      qualityRate, // 品質通過率 (0-100)
      defectRate, // 瑕疵率 (0-100)

      // 瑕疵類型分布
      defectTypeDistribution: defectTypeStats,

      // 趨勢數據
      weeklyTrend: trendData.reverse(), // 從最早到最新

      // 成長指標
      growth: {
        dailyAverage: Number((weeklyInspections / 7).toFixed(1)),
        monthlyGrowth
      },

      // 🔧 新增調試資訊
      debug: {
        avgConfidenceRaw: avgConfidenceValue,
        defectiveInspections,
        totalInspections,
        calculatedDefectRate: defectRate,
        calculatedQualityRate: qualityRate,
        calculatedAvgConfidence: averageConfidence
      },

      // 系統健康狀態
      systemHealth: {
        status: 'healthy',
        uptime: process.uptime(),
        lastUpdate: new Date().toISOString()
      }
    };

    console.log('✅ 全系統統計數據獲取成功:', {
      totalInspections: systemStats.totalInspections,
      totalDefects: systemStats.totalDefects,
      defectiveInspections: systemStats.defectiveInspections,
      defectRate: systemStats.defectRate,
      qualityRate: systemStats.qualityRate,
      averageConfidence: systemStats.averageConfidence,
      debug: systemStats.debug
    });

    return res.status(200).json({
      success: true,
      data: systemStats
    });

  } catch (error) {
    console.error('❌ 獲取全系統統計數據失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取系統統計數據失敗: ' + error.message
    });
  }
};

/**
 * 批量刪除檢測記錄
 */
export const batchDeleteDetectionRecords = async (req, res) => {
  try {
    const { detectionIds } = req.body;
    const userId = req.user.id;

    if (!detectionIds || !Array.isArray(detectionIds) || detectionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '請提供要刪除的檢測記錄ID'
      });
    }

    console.log('🗑️ 開始批量刪除檢測記錄:', { detectionIds, userId });

    // 🔧 導入必要的模型
    const { DetectionHistory, DefectDetail } = await import('../model/detectionHistoryModel.js');

    const deleteResults = [];
    let successCount = 0;
    let failCount = 0;

    // 使用事務確保數據一致性
    const transaction = await sequelize.transaction();

    try {
      // 逐一處理每個檢測記錄
      for (const detectionId of detectionIds) {
        try {
          // 檢查記錄是否存在且屬於當前用戶
          const detectionRecord = await DetectionHistory.findOne({
            where: {
              id: detectionId,
              userId
            },
            transaction
          });

          if (!detectionRecord) {
            console.warn(`⚠️ 檢測記錄 ${detectionId} 不存在或無權刪除`);
            deleteResults.push({
              detectionId,
              success: false,
              message: '記錄不存在或無權刪除'
            });
            failCount++;
            continue;
          }

          // 先刪除相關的瑕疵詳情
          await DefectDetail.destroy({
            where: { detectionId },
            transaction
          });

          // 再刪除檢測記錄
          await DetectionHistory.destroy({
            where: { id: detectionId },
            transaction
          });

          console.log(`✅ 成功刪除檢測記錄: ${detectionId}`);
          deleteResults.push({
            detectionId,
            success: true,
            message: '刪除成功'
          });
          successCount++;

        } catch (recordError) {
          console.error(`❌ 刪除檢測記錄 ${detectionId} 失敗:`, recordError);
          deleteResults.push({
            detectionId,
            success: false,
            message: recordError.message
          });
          failCount++;
        }
      }

      // 提交事務
      await transaction.commit();

      console.log(`🎯 批量刪除完成: 成功 ${successCount}，失敗 ${failCount}`);

      return res.status(200).json({
        success: true,
        data: {
          totalRecords: detectionIds.length,
          successCount,
          failCount,
          results: deleteResults
        },
        message: `批量刪除完成：成功刪除 ${successCount} 條記錄${failCount > 0 ? `，${failCount} 條失敗` : ''}`
      });

    } catch (transactionError) {
      // 回滾事務
      await transaction.rollback();
      throw transactionError;
    }

  } catch (error) {
    console.error('❌ 批量刪除檢測記錄失敗:', error);
    return res.status(500).json({
      success: false,
      message: '批量刪除失敗: ' + error.message
    });
  }
};

/**
 * 刪除單個檢測記錄
 */
export const deleteDetectionRecord = async (req, res) => {
  try {
    const detectionId = req.params.id;
    const userId = req.user.id;

    console.log('🗑️ 刪除單個檢測記錄:', { detectionId, userId });

    // 🔧 導入必要的模型
    const { DetectionHistory, DefectDetail } = await import('../model/detectionHistoryModel.js');

    // 檢查記錄是否存在且屬於當前用戶
    const detectionRecord = await DetectionHistory.findOne({
      where: {
        id: detectionId,
        userId
      }
    });

    if (!detectionRecord) {
      return res.status(404).json({
        success: false,
        message: '檢測記錄不存在或您無權刪除'
      });
    }

    // 使用事務確保數據一致性
    const transaction = await sequelize.transaction();

    try {
      // 先刪除相關的瑕疵詳情
      await DefectDetail.destroy({
        where: { detectionId },
        transaction
      });

      // 再刪除檢測記錄
      await DetectionHistory.destroy({
        where: { id: detectionId },
        transaction
      });

      // 提交事務
      await transaction.commit();

      console.log(`✅ 成功刪除檢測記錄: ${detectionId}`);

      return res.status(200).json({
        success: true,
        message: '檢測記錄已成功刪除'
      });

    } catch (transactionError) {
      // 回滾事務
      await transaction.rollback();
      throw transactionError;
    }

  } catch (error) {
    console.error('❌ 刪除檢測記錄失敗:', error);
    return res.status(500).json({
      success: false,
      message: '刪除記錄失敗: ' + error.message
    });
  }
};

/**
 * 🆕 獲取最近的檢測記錄 - 供 Home 頁面使用
 */
export const getRecentDetections = async (req, res) => {
  try {
    const userId = req.user?.id; // 可選認證，支援訪客和登入用戶
    const limit = parseInt(req.query.limit) || 5; // 預設顯示5條記錄

    console.log('📋 獲取最近檢測記錄:', { userId, limit });

    // 🔧 導入必要的模型
    const { DetectionHistory, DefectDetail } = await import('../model/detectionHistoryModel.js');
    const sequelize = (await import('../config/database.js')).default;

    // 🔧 構建查詢條件
    const whereConditions = {};
    if (userId) {
      whereConditions.userId = userId; // 如果已登入，只顯示該用戶的記錄
    }

    // 🔧 獲取最近的檢測記錄
    const recentDetections = await DetectionHistory.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit,
      attributes: [
        'id',
        'userId',
        'defectCount',
        'averageConfidence',
        'detectionTime',
        'createdAt'
      ]
    });

    console.log(`✅ 找到 ${recentDetections.length} 條最近檢測記錄`);

    // 🔧 為每條記錄添加瑕疵類型信息
    const enrichedDetections = await Promise.all(
      recentDetections.map(async (detection) => {
        // 獲取該檢測記錄的瑕疵類型
        const defectTypes = await DefectDetail.findAll({
          where: { detectionId: detection.id },
          attributes: ['defectType'],
          group: ['defectType']
        });

        const uniqueDefectTypes = [...new Set(defectTypes.map(d => d.defectType))];

        return {
          id: detection.id,
          defectCount: detection.defectCount,
          averageConfidence: Number((detection.averageConfidence * 100).toFixed(1)),
          detectionTime: detection.detectionTime,
          createdAt: detection.createdAt,
          defectTypes: uniqueDefectTypes,
          hasDefects: detection.defectCount > 0,
          qualityStatus: detection.defectCount === 0 ? 'good' : 'defective',
          confidenceLevel: detection.averageConfidence >= 0.8 ? 'high' :
                          detection.averageConfidence >= 0.6 ? 'medium' : 'low',
          // 🔧 計算相對時間
          timeAgo: calculateTimeAgo(detection.createdAt),
          // 🔧 格式化檢測ID
          displayId: `PCB-${String(detection.id).padStart(6, '0')}`
        };
      })
    );

    // 🔧 如果沒有記錄，返回空數組但成功狀態
    return res.status(200).json({
      success: true,
      data: {
        recentDetections: enrichedDetections,
        total: enrichedDetections.length,
        hasMore: recentDetections.length === limit, // 是否還有更多記錄
        isUserSpecific: !!userId, // 是否為用戶專屬記錄
        message: userId
          ? enrichedDetections.length > 0
            ? `顯示您最近的 ${enrichedDetections.length} 次檢測記錄`
            : '您還沒有進行過檢測'
          : enrichedDetections.length > 0
            ? `顯示系統最近的 ${enrichedDetections.length} 次檢測記錄`
            : '系統尚無檢測記錄'
      }
    });

  } catch (error) {
    console.error('❌ 獲取最近檢測記錄失敗:', error);
    return res.status(500).json({
      success: false,
      message: '獲取最近檢測記錄失敗: ' + error.message,
      data: {
        recentDetections: [],
        total: 0,
        hasMore: false,
        isUserSpecific: false
      }
    });
  }
};

/**
 * 🔧 輔助函數：計算相對時間
 */
function calculateTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return '剛剛';
  if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} 小時前`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} 天前`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} 週前`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} 個月前`;
}

/**
 * 初始模型設置 - 將本地模型文件加載到數據庫
 */
export const initializeModel = async () => {
  try {
    console.log('開始檢查模型...');

    // 檢查數據庫中是否已有活躍模型
    const activeModelCount = await DetectionModel.count({
      where: { isActive: true }
    });

    if (activeModelCount > 0) {
      console.log('數據庫中已存在活躍模型記錄，跳過初始化');
      return;
    }

    // 檢查本地模型文件 - 根據您的實際路徑
    const modelRelativePath = 'model/best.onnx'; // 相對於server根目錄
    const modelAbsolutePath = path.resolve(process.cwd(), modelRelativePath);
    console.log('檢查模型文件:', modelAbsolutePath);

    if (!fs.existsSync(modelAbsolutePath)) {
      console.error('找不到本地模型文件:', modelAbsolutePath);
      console.log('請確認模型文件位於:', modelAbsolutePath);
      return;
    }

    const modelStats = fs.statSync(modelAbsolutePath);
    const modelSizeMB = Math.round(modelStats.size / 1024 / 1024);
    console.log('模型文件存在，大小:', modelSizeMB, 'MB');

    // 創建初始模型記錄 (存儲相對路徑)
    await DetectionModel.create({
      modelName: 'PCB瑕疵檢測模型YOLOv11x',
      modelVersion: '1.0',
      modelFile: modelRelativePath, // 存儲相對路徑
      isActive: true,
      uploadedBy: null // 系統初始化
    });

    console.log('✅ 初始模型路徑記錄完成');
  } catch (error) {
    console.error('❌ 初始模型設置失敗:', error);
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
