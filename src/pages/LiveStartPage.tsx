import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Radio,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLiveStore } from '../stores/liveStore';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop';

const categories = [
  { id: '10', name: '综合直播' },
  { id: '5', name: '学习直播' },
  { id: '6', name: '生活直播' },
  { id: '8', name: '游戏直播' },
];

export function LiveStartPage() {
  const navigate = useNavigate();

  const { isLoggedIn, user, openLoginModal } = useAuthStore();
  const { createRoom, currentRoom } = useLiveStore();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('10');
  const [cover, setCover] = useState(DEFAULT_COVER);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const userType = Number(user?.userType ?? 0);

  const handleStart = async () => {
    if (!title.trim()) {
      setErrorMsg('请填写直播间标题');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const room = await createRoom(title.trim(), categoryId, cover.trim() || DEFAULT_COVER);

    setIsLoading(false);

    if (room) {
      navigate(`/live/${room.id}`);
    } else {
      setErrorMsg('创建直播间失败，请检查后端是否启动或重新登录创作者账号。');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(type);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 max-w-sm w-full">
          <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            请先登录
          </h2>

          <p className="text-gray-500 mb-6">
            登录创作者账号后才能创建直播间。
          </p>

          <button
            onClick={openLoginModal}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  if (userType < 1) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 max-w-sm w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            无权限开播
          </h2>

          <p className="text-gray-500 mb-6">
            当前账号不是创作者账号，请使用 creator / creator123 登录。
          </p>

          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                开始直播
              </h1>
              <p className="text-gray-500">
                配置直播间信息，创建后会进入直播间页面。
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                直播间标题 *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：软件工程项目答疑直播"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                直播分类
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryId(category.id)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      categoryId === category.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                        : 'border-gray-200 dark:border-gray-600 hover:border-red-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                直播封面
              </label>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {cover ? (
                    <img
                      src={cover}
                      alt="直播封面"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_COVER;
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-full h-full p-8 text-gray-400" />
                  )}
                </div>

                <input
                  type="text"
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder="请输入直播封面图片链接"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                课程作业说明
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                当前直播功能是演示版：支持创建直播间、进入直播间、显示在线人数、弹幕聊天和推流配置展示。
                真实推流可以后续接入 OBS + SRS / WebRTC 服务。
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={!title.trim() || isLoading}
              className="w-full py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? '创建中...' : '确认开播'}
            </button>
          </div>
        </motion.div>

        {currentRoom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Radio className="w-6 h-6 text-red-500" />

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                推流配置
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  推流地址
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentRoom.pushUrl || 'rtmp://localhost/live/demo'}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  />

                  <button
                    onClick={() =>
                      copyToClipboard(
                        currentRoom.pushUrl || 'rtmp://localhost/live/demo',
                        'push'
                      )
                    }
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {copied === 'push' ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  流密钥
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentRoom.streamKey || 'stream_demo'}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                  />

                  <button
                    onClick={() =>
                      copyToClipboard(currentRoom.streamKey || 'stream_demo', 'key')
                    }
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {copied === 'key' ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
                  OBS 配置指南
                </h3>

                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>打开 OBS Studio</li>
                  <li>设置 → 直播 → 服务选择“自定义”</li>
                  <li>服务器填写上方推流地址</li>
                  <li>串流密钥填写上方流密钥</li>
                  <li>点击“开始直播”即可</li>
                </ol>
              </div>

              <button
                onClick={() => navigate(`/live/${currentRoom.id}`)}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
              >
                进入直播间
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default LiveStartPage;