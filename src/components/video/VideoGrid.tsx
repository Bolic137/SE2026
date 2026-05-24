import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Video as VideoIcon } from 'lucide-react';
import { VideoCard } from './VideoCard';
import type { Video } from '../../stores/videoStore';

interface VideoGridProps {
  videos: Video[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos = [],
  onLoadMore,
  hasMore = false,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    const nearBottom = scrollTop + clientHeight >= scrollHeight - 120;

    if (nearBottom && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div className="h-full overflow-y-auto" onScroll={handleScroll}>
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: Math.min(index * 0.03, 0.3),
              }}
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

      {!hasMore && videos.length > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          没有更多内容了
        </div>
      )}

      {!isLoading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <VideoIcon className="w-16 h-16 mb-4 opacity-60" />
          <p className="text-lg font-medium">暂无视频内容</p>
          <p className="text-sm mt-2">
            可以切换分类，或者上传视频后再查看。
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;