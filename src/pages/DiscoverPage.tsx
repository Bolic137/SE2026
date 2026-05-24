import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2, Radio, Video as VideoIcon, Users } from 'lucide-react';
import { useVideoStore } from '../stores/videoStore';
import { useLiveStore } from '../stores/liveStore';
import { VideoCard } from '../components/video/VideoCard';
import { CategoryBar } from '../components/video/CategoryBar';

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    videos,
    categories,
    isLoading,
    hasMore,
    fetchVideos,
    fetchCategories,
    loadMore,
  } = useVideoStore();

  const {
    rooms,
    isLoading: isLiveLoading,
    fetchRooms,
  } = useLiveStore();

  const [selectedCategory, setSelectedCategory] = useState('0');
  const [activeSection, setActiveSection] = useState<'video' | 'live'>('video');

  useEffect(() => {
    fetchCategories();
    fetchRooms();
  }, [fetchCategories, fetchRooms]);

  useEffect(() => {
    fetchVideos({
      categoryId: selectedCategory,
      page: 1,
    });
  }, [selectedCategory, fetchVideos]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMore();
    }
  };

  const visibleCategories =
    categories && categories.length > 0
      ? categories.filter((category) => category.type === 0)
      : [
          { id: '0', name: '推荐', type: 0 },
          { id: '2', name: '影视', type: 0 },
          { id: '3', name: '动画', type: 0 },
          { id: '4', name: '科技', type: 0 },
          { id: '5', name: '学习', type: 0 },
          { id: '6', name: '生活', type: 0 },
        ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            发现精彩
          </h1>

          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setActiveSection('video')}
              className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                activeSection === 'video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <VideoIcon className="w-4 h-4" />
              视频推荐
            </button>

            <button
              onClick={() => setActiveSection('live')}
              className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                activeSection === 'live'
                  ? 'bg-red-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Radio className="w-4 h-4" />
              直播广场
            </button>
          </div>

          {activeSection === 'video' && (
            <CategoryBar
              categories={visibleCategories}
              activeId={selectedCategory}
              onSelect={handleCategoryChange}
            />
          )}
        </motion.div>

        {activeSection === 'video' && (
          <>
            {videos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <VideoCard
                      video={video}
                      onClick={() => navigate(`/video/${video.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            {!isLoading && videos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <VideoIcon className="w-16 h-16 mb-4 opacity-60" />
                <p className="text-lg font-medium">暂无视频内容</p>
                <p className="text-sm mt-2">可以切换分类，或者上传视频后再查看。</p>
              </div>
            )}

            {hasMore && !isLoading && videos.length > 0 && (
              <div className="flex justify-center py-8">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                >
                  加载更多
                </button>
              </div>
            )}

            {!hasMore && !isLoading && videos.length > 0 && (
              <p className="text-center text-gray-500 py-8">没有更多内容了</p>
            )}
          </>
        )}

        {activeSection === 'live' && (
          <>
            {isLiveLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            )}

            {!isLiveLoading && rooms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <Radio className="w-16 h-16 mb-4 opacity-60" />
                <p className="text-lg font-medium">暂无直播间</p>
                <p className="text-sm mt-2">创作者可以点击“开始直播”创建直播间。</p>
              </div>
            )}

            {!isLiveLoading && rooms.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    onClick={() => navigate(`/live/${room.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                      <img
                        src={room.cover}
                        alt={room.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop';
                        }}
                      />

                      <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        LIVE
                      </div>

                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {room.onlineCount}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                        {room.title}
                      </h3>

                      <div className="flex items-center gap-3 mt-3">
                        <img
                          src={room.anchorAvatar}
                          alt={room.anchorName}
                          className="w-9 h-9 rounded-full bg-gray-200"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=creator';
                          }}
                        />

                        <div className="min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {room.anchorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {room.categoryName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;