import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const ProfileSettings = ({ profile, onUpdateSettings }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dataRetention: '6months',
    language: 'zh-TW',
    theme: 'light',
    autoSave: true
  });

  const [loading, setLoading] = useState(false);

  // 處理設定變更
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 保存設定
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // 這裡可以調用API保存設定
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬API調用
      console.log('設定已保存:', settings);
    } catch (error) {
      console.error('保存設定失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 通知設定 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          通知設定
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                電子郵件通知
              </label>
              <p className="text-xs text-gray-500">
                接收檢測結果和系統更新的電子郵件
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </motion.button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                推送通知
              </label>
              <p className="text-xs text-gray-500">
                接收即時的瀏覽器推送通知
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </motion.button>
          </div>
        </div>
      </Card>

      {/* 數據管理 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          數據管理
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              數據保留期限
            </label>
            <select
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1month">1個月</option>
              <option value="3months">3個月</option>
              <option value="6months">6個月</option>
              <option value="1year">1年</option>
              <option value="forever">永久保留</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              選擇您的檢測數據保留時間，過期數據將自動清理
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                自動保存檢測結果
              </label>
              <p className="text-xs text-gray-500">
                自動將檢測結果保存到歷史記錄
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.autoSave ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${settings.autoSave ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </motion.button>
          </div>
        </div>
      </Card>

      {/* 介面設定 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          介面設定
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              語言
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主題
            </label>
            <div className="flex space-x-3">
              {['light', 'dark', 'auto'].map((theme) => (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('theme', theme)}
                  className={`
                    px-4 py-2 text-sm rounded-md border transition-colors
                    ${settings.theme === theme
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {theme === 'light' ? '淺色' : theme === 'dark' ? '深色' : '自動'}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 帳戶資訊 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          帳戶資訊
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">帳戶狀態</span>
            <Badge variant="success">正常</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">儲存空間使用</span>
            <div className="text-sm text-gray-900">
              <span className="font-medium">245MB</span> / 1GB
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">本月檢測次數</span>
            <div className="text-sm text-gray-900">
              <span className="font-medium">{profile?.stats?.monthlyDetections || 0}</span> 次
            </div>
          </div>
        </div>
      </Card>

      {/* 保存按鈕 */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              保存中...
            </div>
          ) : (
            '保存設定'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ProfileSettings;
