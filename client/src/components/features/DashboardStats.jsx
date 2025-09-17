import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import useStats from '../../hooks/useStats';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

export default function DashboardStats() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>載入統計數據時發生錯誤: {error}</p>
      </div>
    );
  }

  // 🔧 更新：使用真實的系統統計數據
  const statItems = [
    {
      title: '總檢測數',
      value: stats?.totalInspections?.toLocaleString() || '0',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      textColor: 'text-blue-600',
      subtitle: `本週新增 ${stats?.weeklyInspections || 0} 次檢測`,
      trend: stats?.growth?.monthlyGrowth > 0 ? `+${stats.growth.monthlyGrowth}%` : null
    },
    {
      title: '檢出瑕疵數',
      value: stats?.totalDefects?.toLocaleString() || '0',
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      textColor: 'text-red-600',
      subtitle: `瑕疵率 ${stats?.defectRate || 0}%`,
      trend: stats?.defectRate < 5 ? '品質優良' : '需要關注'
    },
    {
      title: '檢測準確率',
      value: `${stats?.averageConfidence || 0}%`,
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      textColor: 'text-green-600',
      subtitle: `品質通過率 ${stats?.qualityRate || 0}%`,
      trend: stats?.averageConfidence > 90 ? '精確度優秀' : '持續改善中'
    },
    {
      title: '活躍用戶',
      value: stats?.totalUsers?.toLocaleString() || '0',
      icon: (
        <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      textColor: 'text-purple-600',
      subtitle: `24小時內 ${stats?.recentActivity || 0} 次檢測`,
      trend: stats?.recentActivity > 0 ? '系統活躍' : '待檢測'
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">系統概況</h2>

        {/* 🔧 新增：實時狀態指示器 */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>系統運行正常</span>
          <span>•</span>
          <span>數據實時更新</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <div className="p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="mr-3">{item.icon}</div>
                    <h3 className="text-sm font-semibold text-gray-600">{item.title}</h3>
                  </div>

                  {/* 趨勢指示器 */}
                  {item.trend && (
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${item.trend.includes('+')
                        ? 'bg-green-100 text-green-600'
                        : item.trend.includes('優')
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {item.trend}
                    </span>
                  )}
                </div>

                <div className={`text-3xl font-bold ${item.textColor} mb-2`}>
                  {item.value}
                </div>

                {/* 副標題 */}
                {item.subtitle && (
                  <p className="text-xs text-gray-500 mt-auto">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 🔧 新增：瑕疵類型分布快覽 */}
      {stats?.defectTypeDistribution && stats.defectTypeDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">瑕疵類型分布</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.defectTypeDistribution.map((defect, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {defect.count}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {defect.type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {defect.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
