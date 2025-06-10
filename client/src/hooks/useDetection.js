import { useState, useCallback } from 'react';
import { detectDefectsInImage, saveDetectionResult } from '../services/detectionService';
import { compressImage } from '../utils/imageUtils';
import useAuth from './useAuth';

/**
 * 自定義Hook用於處理PCB瑕疵檢測邏輯
 */
const useDetection = () => {
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // 重置檢測數據
  const resetDetection = useCallback(() => {
    setImage(null);
    setResults(null);
    setError(null);
    setProgress(0);
  }, []);

  // 模擬進度更新
  const simulateProgress = useCallback(() => {
    // 使用計時器模擬進度，從0到90%
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress > 90) {
        currentProgress = 90;
        clearInterval(interval);
      }
      setProgress(currentProgress);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // 開始檢測
  const detectDefects = useCallback(async (confidenceThreshold = 0.5) => {
    if (!image) {
      setError('請先上傳PCB圖像');
      return null;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setResults(null);
      setProgress(0);

      // 開始模擬進度
      const stopSimulation = simulateProgress();

      // 壓縮圖像以提高上傳和處理速度
      const compressedImage = await compressImage(image, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9
      });

      // 呼叫API進行檢測
      const result = await detectDefectsInImage(compressedImage, {
        confidenceThreshold,
        userId: isAuthenticated() ? user?.id : null
      });

      // 檢測完成，停止模擬進度
      stopSimulation();
      setProgress(100);

      // 如果有結果，處理結果
      if (result.success) {
        setResults(result.data);

        // 如果用戶已登入，自動保存結果
        if (isAuthenticated() && user) {
          await saveDetectionResult(result.data, user.id);
        }

        return result.data;
      } else {
        throw new Error(result.message || '檢測失敗');
      }
    } catch (err) {
      setError(err.message || '檢測過程中發生錯誤');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [image, isAuthenticated, user, simulateProgress]);

  // 保存檢測結果到用戶歷史記錄
  const saveResults = useCallback(async () => {
    if (!results || !isAuthenticated() || !user) {
      setError('無法保存結果：用戶未登入或沒有檢測結果');
      return false;
    }

    try {
      const saveResult = await saveDetectionResult(results, user.id);
      return saveResult.success;
    } catch (err) {
      setError(err.message || '保存結果時發生錯誤');
      return false;
    }
  }, [results, isAuthenticated, user]);

  return {
    image,
    setImage,
    isProcessing,
    progress,
    results,
    error,
    detectDefects,
    resetDetection,
    saveResults
  };
};

export default useDetection;
