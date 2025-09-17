import React from 'react';
import { motion } from 'framer-motion';

const DetectionProgress = ({ progress = 0 }) => {
  const stages = [
    { name: '準備模型', percentage: 20 },
    { name: '分析圖像', percentage: 50 },
    { name: '識別瑕疵', percentage: 80 },
    { name: '生成報告', percentage: 100 }
  ];

  // 找出當前階段
  const currentStage = stages.find(stage => progress <= stage.percentage) || stages[stages.length - 1];
  const currentStageIndex = stages.indexOf(currentStage);

  return (
    <div className="mt-8 mb-6">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              {currentStage.name}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
          />
        </div>

        <div className="flex justify-between">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className={`text-xs ${idx <= currentStageIndex ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
            >
              {stage.name}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        <p className="mt-2 text-gray-600">請耐心等待，AI模型正在分析您的PCB圖像...</p>
      </div>
    </div>
  );
};

export default DetectionProgress;
