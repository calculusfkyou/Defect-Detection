import React from 'react';

const DetectionHeader = () => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">PCB瑕疵檢測</h1>
      <p className="text-gray-600 max-w-3xl mx-auto">
        上傳您的PCB圖像，我們的YOLO模型將自動檢測並標記潛在的製造瑕疵，包括：
        缺失孔、鼠咬、開路、短路、毛刺和多餘銅。高精度、快速的檢測結果幫助您提升品質控制效率。
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          缺失孔
        </span>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          鼠咬
        </span>
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          開路
        </span>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          短路
        </span>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          毛刺
        </span>
        <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
          多餘銅
        </span>
      </div>
    </div>
  );
};

export default DetectionHeader;
