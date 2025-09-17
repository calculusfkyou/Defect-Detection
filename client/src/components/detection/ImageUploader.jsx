import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

const ImageUploader = ({ onFileUpload, selectedImage }) => {
  const [error, setError] = useState('');

  // 處理文件拖放
  const onDrop = useCallback((acceptedFiles) => {
    // 檢查文件格式與大小
    const file = acceptedFiles[0];
    if (!file) return;

    // 檢查文件類型
    if (!file.type.match('image/(jpeg|jpg|png|bmp)')) {
      setError('請上傳JPG、PNG或BMP格式的圖片');
      return;
    }

    // 檢查文件大小 (限制為10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('圖片大小不能超過10MB');
      return;
    }

    setError('');
    onFileUpload(file);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp']
    },
    maxFiles: 1
  });

  // 如果已上傳圖片，顯示預覽
  const renderPreview = () => {
    if (!selectedImage) return null;

    return (
      <div className="mt-4 relative">
        <img
          src={URL.createObjectURL(selectedImage)}
          alt="PCB圖片預覽"
          className="max-h-60 max-w-full mx-auto rounded-lg shadow-md"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFileUpload(null);
          }}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="mb-6">
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />

        {selectedImage ? (
          renderPreview()
        ) : (
          <div>
            <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>

            <p className="mt-4 text-lg text-gray-600">
              {isDragActive ? '釋放以上傳圖片' : '拖放PCB圖片至此處，或點擊選擇檔案'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              支援JPG、PNG和BMP格式，最大10MB
            </p>
          </div>
        )}
      </motion.div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
