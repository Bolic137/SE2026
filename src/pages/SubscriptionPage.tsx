import React from 'react';
import { motion } from 'framer-motion';
import { VideoCard } from '../components/video/VideoCard';
import { Users } from 'lucide-react';

const mockSubscribedVideos = [
  {
    id: 'sub1',
    title: '创作者小王的最新作品',
    description: '精彩内容',
    tags: ['生活'],
    coverUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=640&h=360&fit=crop',
    videoUrl: '',
    duration: 180,
    categoryId: '5',
    categoryName: '生活',
    viewCount: 5600,
    likeCount: 456,
    commentCount: 78,
    favoriteCount: 234,
    uploaderId: '2',
    uploaderName: '创作者小王',
    uploaderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
    uploadTime: '2024-01-16T10:00:00Z',
    auditStatus: 1
  },
  {
    id: 'sub2',
    title: '游戏直播精彩回放',
    description: '精彩游戏',
    tags: ['游戏'],
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop',
    videoUrl: '',
    duration: 240,
    categoryId: '1',
    categoryName: '游戏',
    viewCount: 8900,
    likeCount: 678,
    commentCount: 123,
    favoriteCount: 345,
    uploaderId: '3',
    uploaderName: '普通用户',
    uploaderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    uploadTime: '2024-01-15T15:00:00Z',
    auditStatus: 1
  }
];

export function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            我的订阅
          </h1>
          <p className="text-gray-500 mt-1">关注创作者的最新动态</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mockSubscribedVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </div>

        {mockSubscribedVideos.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无订阅内容</p>
            <p className="text-sm mt-2">关注创作者后，他们的新视频会出现在这里</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPage;
