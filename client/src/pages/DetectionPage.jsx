import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import useDetection from '../hooks/useDetection';

// Layout Components
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';

// Detection Components
import DetectionHeader from '../components/detection/DetectionHeader';
import ImageUploader from '../components/detection/ImageUploader';
import DetectionControls from '../components/detection/DetectionControls';
import DetectionProgress from '../components/detection/DetectionProgress';
import DetectionResult from '../components/detection/DetectionResult';
import SaveResultsPrompt from '../components/detection/SaveResultsPrompt';

const DetectionPage = () => {
  const { isAuthenticated } = useAuth();
  const {
    image,
    setImage,
    isProcessing,
    progress,
    detectDefects,
    results,
    resetDetection
  } = useDetection();

  // 檢測頁面狀態
  const [showResults, setShowResults] = useState(false);

  // 當有結果時顯示結果區域
  useEffect(() => {
    if (results) {
      setShowResults(true);
    }
  }, [results]);

  // 處理圖片上傳
  const handleImageUpload = (file) => {
    setImage(file);
    setShowResults(false); // 新圖片時，重置結果顯示
  };

  // 開始檢測
  const handleDetect = async (confidence) => {
    if (!image) return;
    try {
      await detectDefects(confidence); // 傳遞置信度參數
    } catch (error) {
      console.error('檢測失敗:', error);
      // 可以在這裡添加錯誤提示
    }
  };

  // 重置檢測
  const handleReset = () => {
    resetDetection();
    setShowResults(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <Container className="py-8 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <DetectionHeader />

          {!showResults ? (
            <>
              <ImageUploader
                onFileUpload={handleImageUpload}
                selectedImage={image}
              />

              <DetectionControls
                onDetect={handleDetect}
                onReset={handleReset}
                disabled={!image || isProcessing}
                isProcessing={isProcessing}
              />

              {isProcessing && (
                <DetectionProgress progress={progress} />
              )}

              {/* 訪客保存提示 */}
              {!isAuthenticated() && (
                <SaveResultsPrompt />
              )}
            </>
          ) : (
            <>
              {results && (
                <DetectionResult
                  results={results}
                  originalImage={image}
                  onReset={handleReset}
                />
              )}
            </>
          )}
        </motion.div>
      </Container>

      <Footer />
    </div>
  );
};

export default DetectionPage;
