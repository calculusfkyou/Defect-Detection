import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useGuides from '../../hooks/useGuides';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import Badge from '../ui/Badge';

export default function QuickStartGuide({ isAuthenticated }) {
  const { features, guides, loading, error } = useGuides();
  const [activeTab, setActiveTab] = useState('features');

  // 功能卡片圖標
  const iconComponents = {
    detection: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
    history: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    // 🔧 修改：將 report 圖標改為 profile 圖標
    profile: (
      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
    camera: (
      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    search: (
      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    // 🔧 修改：將 chart 圖標改為 user 圖標（用於個人資料管理步驟）
    user: (
      <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">使用指南</h2>
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">使用指南</h2>
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <p>載入指南時發生錯誤: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">使用指南</h2>
        <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
          <button
            onClick={() => setActiveTab('features')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'features' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            核心功能
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'guides' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            使用步驟
          </button>
        </div>
      </div>

      {activeTab === 'features' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* 使用條件渲染：需要驗證且未登入時使用 div 而非 Link */}
              {(feature.requiresAuth && !isAuthenticated) ? (
                <div className="block group relative cursor-not-allowed">
                  <Card className="h-full">
                    <div className="p-6 h-64 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            {iconComponents[feature.icon]}
                          </div>
                          <Badge variant="warning">需要登入</Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                      <div className="mt-4 flex items-center text-blue-600 font-medium">
                        <span>登入使用</span>
                        <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </Card>

                  {/* 覆蓋層 */}
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-3 rounded-full shadow-lg">
                      <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>

                  {/* 登入按鈕 */}
                  <Link
                    to="/login"
                    className="absolute bottom-5 right-5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors z-10"
                  >
                    登入
                  </Link>
                </div>
              ) : (
                <Link
                  to={feature.to}
                  className="block group relative"
                >
                  <Card className="h-full group-hover:shadow-lg transition-shadow">
                    <div className="p-6 h-64 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                            {iconComponents[feature.icon]}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                      <div className="mt-4 flex items-center text-blue-600 font-medium">
                        <span>立即使用</span>
                        <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTab === 'guides' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {guides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="p-6 h-64 flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg mr-2">
                      {iconComponents[guide.icon] || iconComponents.user}
                    </div>
                    <h3 className="text-lg font-semibold">{guide.title}</h3>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 flex-grow">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-sm">{step}</li>
                    ))}
                  </ol>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-6 text-center">
        <Link to="/help" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
          查看完整使用手冊
          <svg className="ml-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
