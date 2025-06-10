import React, { useState, useRef, useEffect } from 'react';

const ImageComparison = ({ originalImage, resultImage }) => {
  const [position, setPosition] = useState(50); // 初始位置為中間
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [panEnabled, setPanEnabled] = useState(false);

  // 轉換Blob或File為URL
  const getImageUrl = (image) => {
    if (image instanceof Blob || image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image;
  };

  // 原始圖片URL
  const originalImageUrl = getImageUrl(originalImage);

  // 結果圖片URL (如果是base64或URL，直接使用)
  const resultImageUrl = resultImage instanceof Blob || resultImage instanceof File
    ? getImageUrl(resultImage)
    : resultImage;

  // 處理滑桿移動
  const handleMove = (e) => {
    if (!isDragging) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newPosition;

    if (e.type === 'mousemove') {
      // 鼠標事件
      newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    } else if (e.type === 'touchmove') {
      // 觸摸事件
      newPosition = ((e.touches[0].clientX - containerRect.left) / containerRect.width) * 100;
    }

    // 確保位置在0-100之間
    newPosition = Math.max(0, Math.min(100, newPosition));
    setPosition(newPosition);
  };

  // 開始拖動
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // 結束拖動
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 處理縮放
  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
  };

  // 切換平移模式
  const togglePan = () => {
    setPanEnabled(!panEnabled);
  };

  // 註冊鼠標事件
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-medium text-gray-800">原始圖像與檢測結果對比</h3>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">縮放:</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-600 ml-2">{zoom.toFixed(1)}x</span>
          </div>

          <button
            onClick={togglePan}
            className={`px-3 py-1 text-sm rounded-md ${
              panEnabled
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {panEnabled ? '拖動已啟用' : '啟用拖動'}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full h-[400px] overflow-hidden border border-gray-200 rounded-lg ${
          panEnabled ? 'cursor-move' : 'cursor-default'
        }`}
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        }}
      >
        {/* 原始圖片 */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-gray-200 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${originalImageUrl})`,
            backgroundSize: `${zoom * 100}%`,
            transform: panEnabled ? 'translate(0, 0)' : 'none',
            zIndex: 10
          }}
        />

        {/* 結果圖片 */}
        <div
          className="absolute top-0 left-0 h-full bg-gray-200 bg-center bg-no-repeat"
          style={{
            width: `${position}%`,
            backgroundImage: `url(${resultImageUrl})`,
            backgroundSize: `${zoom * 100}%`,
            transform: panEnabled ? 'translate(0, 0)' : 'none',
            zIndex: 20,
            overflow: 'hidden'
          }}
        />

        {/* 滑動條 */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-md z-30"
          style={{ left: `${position}%` }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* 標籤 */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded z-30">
          原始圖像
        </div>
        <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded z-30">
          檢測結果
        </div>
      </div>

      <div className="mt-3 text-center text-sm text-gray-600">
        左右滑動以比較原始圖像和檢測結果
      </div>
    </div>
  );
};

export default ImageComparison;
