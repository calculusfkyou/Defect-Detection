import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DetectionControls = ({ onDetect, onReset, disabled, isProcessing }) => {
  const [confidence, setConfidence] = useState(0.5); // 預設置信度閾值

  return (
    <div className="py-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:justify-between sm:space-x-4 border-t border-gray-200">
      <div className="w-full sm:w-1/2">
        <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 mb-1">
          置信度閾值: {confidence.toFixed(2)}
        </label>
        <input
          type="range"
          id="confidence"
          min="0.1"
          max="0.9"
          step="0.05"
          value={confidence}
          onChange={(e) => setConfidence(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={disabled}
        />
      </div>

      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          disabled={disabled}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          重設
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onDetect(confidence)}
          disabled={disabled}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? '檢測中...' : '開始檢測'}
        </motion.button>
      </div>
    </div>
  );
};

export default DetectionControls;
