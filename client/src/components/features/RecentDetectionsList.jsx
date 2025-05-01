import { motion } from 'framer-motion';
import Badge from '../ui/Badge.jsx';
import { Link } from 'react-router-dom';

export default function RecentDetectionsList() {
  // 模擬資料，實際應從API獲取
  const recentDetections = [
    { id: 1, date: '2025-04-26', hasDefect: true, defectCount: 3, imageUrl: 'https://placehold.co/80x60', boardType: 'PCB-A1' },
    { id: 2, date: '2025-04-25', hasDefect: false, defectCount: 0, imageUrl: 'https://placehold.co/80x60', boardType: 'PCB-B2' },
    { id: 3, date: '2025-04-24', hasDefect: true, defectCount: 1, imageUrl: 'https://placehold.co/80x60', boardType: 'PCB-A1' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">最近的檢測記錄</h2>
        <Link to="/history" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          查看全部
        </Link>
      </div>

      {recentDetections.length === 0 ? (
        <p className="text-gray-500 text-center py-4">尚無檢測記錄</p>
      ) : (
        <motion.div
          className="bg-white rounded-lg shadow overflow-hidden"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <ul className="divide-y divide-gray-200">
            {recentDetections.map(detection => (
              <motion.li
                key={detection.id}
                variants={item}
                className="hover:bg-gray-50"
              >
                <Link to={`/detection/${detection.id}`} className="px-4 py-4 sm:px-6 flex items-center">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      <img className="h-12 w-16 rounded object-cover" src={detection.imageUrl} alt="PCB圖片" />
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {detection.boardType}
                      </p>
                      <p className="mt-1 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {detection.date}
                      </p>
                    </div>
                  </div>
                  <div>
                    {detection.hasDefect ? (
                      <Badge variant="error">發現 {detection.defectCount} 個瑕疵</Badge>
                    ) : (
                      <Badge variant="success">無瑕疵</Badge>
                    )}
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
