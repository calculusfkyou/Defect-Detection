import { useState, useCallback } from 'react';
import { detectDefectsInImage } from '../services/detectionService';
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
  const { user } = useAuth();

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

      console.log('🔍 開始檢測，置信度:', confidenceThreshold);

      // 開始模擬進度
      const stopSimulation = simulateProgress();

      // 呼叫API進行檢測 - 注意這裡不需要壓縮，直接使用原圖
      const result = await detectDefectsInImage(image, {
        confidenceThreshold: confidenceThreshold,
        userId: user?.id
      });

      // 檢測完成，停止模擬進度
      stopSimulation();
      setProgress(100);

      console.log('🔍 useDetection 收到檢測結果:', result);

      // 如果有結果，處理結果
      if (result.success && result.data) {
        console.log('✅ 檢測成功，設置結果:', {
          defectsCount: result.data.defects?.length || 0,
          hasOriginalImage: !!result.data.originalImage,
          hasResultImage: !!result.data.resultImage,
          summary: result.data.summary
        });

        setResults(result.data);  // 🔑 設置檢測結果
        return result.data;
      } else {
        throw new Error(result.message || '檢測失敗');
      }
    } catch (err) {
      console.error('檢測過程錯誤:', err);
      setError(err.message || '檢測過程中發生錯誤');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [image, user, simulateProgress]);

  return {
    image,
    setImage,
    isProcessing,
    progress,
    results,
    error,
    detectDefects,
    resetDetection
  };
};

export default useDetection;
