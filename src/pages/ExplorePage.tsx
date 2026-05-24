import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Hash, Users, Compass } from 'lucide-react';

const hotTopics = [
  { id: '1', title: '2024年度盘点', count: '234万热度' },
  { id: '2', title: '春节联欢晚会', count: '189万热度' },
  { id: '3', title: '新年flag', count: '156万热度' },
  { id: '4', title: '美食探店', count: '128万热度' },
];

const trendingTags = [
  { id: '1', name: '搞笑', count: '12.3万视频' },
  { id: '2', name: '美食', count: '8.9万视频' },
  { id: '3', name: '旅行', count: '6.7万视频' },
  { id: '4', name: '萌宠', count: '5.4万视频' },
  { id: '5', name: '科技', count: '4.2万视频' },
  { id: '6', name: '音乐', count: '3.8万视频' },
];

const creators = [
  { id: '1', name: '创作者小王', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', fans: '12.5万' },
  { id: '2', name: '美食达人', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', fans: '8.9万' },
  { id: '3', name: '旅行博主', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', fans: '6.7万' },
  { id: '4', name: '科技前沿', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', fans: '5.2万' },
];

const categories = [
  { id: '1', name: '游戏', icon: '🎮', color: 'bg-purple-500' },
  { id: '2', name: '音乐', icon: '🎵', color: 'bg-pink-500' },
  { id: '3', name: '影视', icon: '🎬', color: 'bg-red-500' },
  { id: '4', name: '科技', icon: '💻', color: 'bg-blue-500' },
  { id: '5', name: '生活', icon: '🏠', color: 'bg-green-500' },
  { id: '6', name: '美食', icon: '🍔', color: 'bg-orange-500' },
];

export function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-500" />
            探索发现
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              热门话题
            </h2>
            <div className="space-y-3">
              {hotTopics.map((topic, i) => (
                <div key={topic.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                  <span className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold ${i < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{topic.title}</p>
                    <p className="text-xs text-gray-500">{topic.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-blue-500" />
              Trending标签
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag.id}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300 hover:text-blue-600 rounded-full text-sm transition-colors"
                >
                  #{tag.name}
                  <span className="ml-1 text-xs text-gray-400">{tag.count}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              推荐创作者
            </h2>
            <div className="space-y-3">
              {creators.map((creator) => (
                <div key={creator.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                  <img src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium">{creator.name}</p>
                    <p className="text-xs text-gray-500">{creator.fans}粉丝</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600">
                    关注
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h2 className="font-bold mb-4">分类探索</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="flex flex-col items-center gap-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {cat.icon}
                </div>
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
