import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const ProfileStats = ({ stats, topDefectTypes }) => {
  // 統計卡片配置
  const statCards = [
    {
      title: '總檢測次數',
      value: stats.totalDetections,
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'blue',
      subtitle: `本月 ${stats.monthlyDetections} 次`
    },
    {
      title: '檢出瑕疵總數',
      value: stats.totalDefects,
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'red',
      subtitle: `本週 ${stats.weeklyDetections} 次檢測`
    },
    {
      title: '平均置信度',
      value: `${stats.averageConfidence}%`,
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      subtitle: `品質率 ${stats.qualityRate}%`
    },
    {
      title: '檢測效率',
      value: stats.totalDetections > 0 ? `${Math.round(stats.totalDetections / Math.max(1, Math.ceil((new Date() - new Date(stats.lastDetectionDate || new Date())) / (1000 * 60 * 60 * 24)))) || 1}` : '0',
      icon: (
        <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'purple',
      subtitle: '次/天'
    }
  ];

  // 動畫配置
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
    <div className="space-y-6">
      {/* 統計卡片 */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold text-${stat.color}-600`}>
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* 瑕疵類型統計 */}
      {topDefectTypes && topDefectTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              常見瑕疵類型
            </h3>
            <div className="space-y-4">
              {topDefectTypes.map((defect, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${index === 0 ? 'bg-red-500' :
                        index === 1 ? 'bg-yellow-500' : 'bg-blue-500'}
                    `}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {defect.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {defect.count} 次
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`
                          h-2 rounded-full
                          ${index === 0 ? 'bg-red-500' :
                            index === 1 ? 'bg-yellow-500' : 'bg-blue-500'}
                        `}
                        style={{
                          width: `${Math.min(100, (defect.count / Math.max(...topDefectTypes.map(d => d.count))) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileStats;
