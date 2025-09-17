import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const ProfileInfo = ({ profile, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!profile) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  const { user, accountInfo } = profile;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          基本資料
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          編輯資料
        </motion.button>
      </div>

      <div className="space-y-4">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電子郵件
              <span className="text-xs text-blue-600 ml-2">(帳戶標識，不可更改)</span>
            </label>
            <p className="text-sm text-gray-900 bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
              {user.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <div className="flex items-center space-x-2">
              {user.role === 'admin' ? (
                <Badge variant="error">管理員</Badge>
              ) : (
                <Badge variant="success">一般用戶</Badge>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              帳戶狀態
            </label>
            <div className="flex items-center space-x-2">
              {accountInfo.status === 'active' ? (
                <Badge variant="success">正常</Badge>
              ) : (
                <Badge variant="warning">停用</Badge>
              )}
            </div>
          </div>
        </div>

        {/* 詳細信息切換 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">
              詳細資訊
            </span>
            <motion.svg
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: showDetails ? 'auto' : 0,
              opacity: showDetails ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    加入時間
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(accountInfo.joinDate).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {user.lastLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最後登入
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(user.lastLogin).toLocaleString('zh-TW')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用戶ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    #{user.id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    帳戶類型
                  </label>
                  <p className="text-sm text-gray-900">
                    {user.role === 'admin' ? '系統管理員' : '標準用戶'}
                  </p>
                </div>
              </div>

              {/* 使用天數計算 */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">使用天數</span>
                  <span className="font-medium text-gray-900">
                    {Math.ceil((new Date() - new Date(accountInfo.joinDate)) / (1000 * 60 * 60 * 24))} 天
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileInfo;
