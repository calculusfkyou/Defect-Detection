import React, { useState, useRef, useEffect } from 'react';

const ImageComparison = ({ originalImage, resultImage }) => {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);

  console.log('🔍 ImageComparison 收到的圖片:', {
    hasOriginal: !!originalImage,
    hasResult: !!resultImage,
    originalType: typeof originalImage,
    resultType: typeof resultImage,
    originalLength: originalImage?.length,
    resultLength: resultImage?.length
  });

  // 處理滑桿移動
  const handleMove = (e) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newPosition;

    if (e.type === 'mousemove') {
      newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    } else if (e.type === 'touchmove') {
      newPosition = ((e.touches[0].clientX - containerRect.left) / containerRect.width) * 100;
    }

    newPosition = Math.max(0, Math.min(100, newPosition));
    setPosition(newPosition);
  };

  // 開始拖動
  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 結束拖動
  const handleEnd = () => {
    setIsDragging(false);
  };

  // 註冊事件監聽
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  // 檢查圖片是否存在
  if (!originalImage || !resultImage) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">圖像對比</h3>
        <div className="w-full h-[400px] border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-gray-500">
              {!originalImage && !resultImage ? '沒有可比較的圖像' :
               !originalImage ? '缺少原始圖像' : '缺少檢測結果圖像'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">圖像對比</h3>
        <div className="text-sm text-gray-600">
          拖動中間的滑桿來比較原始圖像和檢測結果
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[500px] overflow-hidden border border-gray-200 rounded-lg cursor-ew-resize select-none"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* 🔧 原始圖片 - 完整背景 */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: `url(${originalImage})`,
            zIndex: 1
          }}
        />

        {/* 🔧 結果圖片 - 使用裁剪遮罩 */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: `url(${resultImage})`,
            clipPath: `inset(0 ${100 - position}% 0 0)`,
            zIndex: 2
          }}
        />

        {/* 分割線 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-ew-resize"
          style={{ left: `${position}%` }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        >
          {/* 拖動控制點 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-blue-500 cursor-ew-resize">
            <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* 圖片標籤 */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-black bg-opacity-75 text-white text-sm rounded z-20">
          原始圖像
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 bg-black bg-opacity-75 text-white text-sm rounded z-20">
          檢測結果
        </div>

        {/* 分割線位置指示 */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black bg-opacity-75 text-white text-sm rounded z-20">
          {position.toFixed(0)}%
        </div>
      </div>

      {/* 操作提示 */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
            <span>原始圖像</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span>檢測結果</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageComparison;
