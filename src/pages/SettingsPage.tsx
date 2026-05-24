import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Lock, User, FileText, Save } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSaveProfile = () => {
    updateUser({ nickname, bio });
    setMessage('资料已保存');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      setMessage('两次密码不一致');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('密码至少6位');
      return;
    }
    setMessage('密码已修改');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8"
        >
          <h1 className="text-2xl font-bold mb-8">个人设置</h1>

          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg"
            >
              {message}
            </motion.div>
          )}

          <div className="mb-8">
            <label className="block text-sm font-medium mb-3">头像</label>
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Camera className="w-4 h-4" />
                更换头像
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-1" />
              昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="2-20字"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              简介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="介绍一下自己"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Save className="w-4 h-4" />
            保存资料
          </button>

          <div className="border-t my-8" />

          <h2 className="text-lg font-semibold mb-4">
            <Lock className="w-5 h-5 inline mr-2" />
            修改密码
          </h2>

          <div className="space-y-4">
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="原密码"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="新密码"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="确认新密码"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleChangePassword}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              修改密码
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
