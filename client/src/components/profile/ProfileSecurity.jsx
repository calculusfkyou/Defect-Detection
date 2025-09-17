import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Card from '../ui/Card';

const ProfileSecurity = ({
  onChangePassword,
  onDeleteAccount,
  changingPassword,
  deletingAccount
}) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmDelete: ''
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  // 處理密碼表單變更
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 處理刪除表單變更
  const handleDeleteChange = (e) => {
    const { name, value } = e.target;
    setDeleteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 提交密碼更改
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密碼與確認密碼不符');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('新密碼長度不能少於6個字符');
      return;
    }

    try {
      const result = await onChangePassword(passwordForm);
      if (result.success) {
        toast.success('密碼更改成功');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('密碼更改失敗');
    }
  };

  // 提交帳戶刪除
  const handleDeleteSubmit = async (e) => {
    e.preventDefault();

    if (deleteForm.confirmDelete !== 'DELETE') {
      toast.error('請輸入 DELETE 確認刪除');
      return;
    }

    if (!deleteForm.password) {
      toast.error('請輸入當前密碼');
      return;
    }

    try {
      const result = await onDeleteAccount(deleteForm);
      if (result.success) {
        toast.success('帳戶刪除成功');
        // 刪除成功後會自動登出並重定向
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('帳戶刪除失敗');
    }
  };

  return (
    <div className="space-y-6">
      {/* 密碼更改 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              更改密碼
            </h3>
            <p className="text-sm text-gray-600">
              定期更改密碼可提高帳戶安全性
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showPasswordForm ? '取消' : '更改密碼'}
          </motion.button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: showPasswordForm ? 'auto' : 0,
            opacity: showPasswordForm ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                當前密碼
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入當前密碼"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新密碼
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入新密碼（至少6個字符）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                確認新密碼
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="請再次輸入新密碼"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {changingPassword ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    更改中...
                  </div>
                ) : (
                  '確認更改'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </Card>

      {/* 帳戶刪除 */}
      <Card className="p-6 border-red-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-red-900">
              刪除帳戶
            </h3>
            <p className="text-sm text-red-600">
              ⚠️ 此操作不可逆，將永久刪除您的帳戶和所有相關數據
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteForm(!showDeleteForm)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {showDeleteForm ? '取消' : '刪除帳戶'}
          </motion.button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: showDeleteForm ? 'auto' : 0,
            opacity: showDeleteForm ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-red-700">
                <p className="font-medium">刪除帳戶將會：</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>永久刪除您的個人資料</li>
                  <li>刪除所有檢測歷史記錄</li>
                  <li>刪除所有相關的瑕疵檢測數據</li>
                  <li>此操作無法復原</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleDeleteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                當前密碼
              </label>
              <input
                type="password"
                name="password"
                value={deleteForm.password}
                onChange={handleDeleteChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="請輸入當前密碼"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                確認刪除
              </label>
              <input
                type="text"
                name="confirmDelete"
                value={deleteForm.confirmDelete}
                onChange={handleDeleteChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="請輸入 DELETE 確認刪除"
              />
              <p className="text-xs text-gray-500 mt-1">
                請輸入 <code className="bg-gray-100 px-1 rounded">DELETE</code> 確認刪除操作
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteForm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={deletingAccount}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deletingAccount ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    刪除中...
                  </div>
                ) : (
                  '確認刪除帳戶'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </Card>
    </div>
  );
};

export default ProfileSecurity;
