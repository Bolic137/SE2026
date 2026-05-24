import React from 'react';
import { Play, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Video } from '../../stores/videoStore';

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
}

const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=900&auto=format&fit=crop';

function formatCount(count: number): string {
  const safeCount = Number(count || 0);

  if (safeCount >= 10000) {
    return (safeCount / 10000).toFixed(1) + '万';
  }

  return safeCount.toString();
}

function formatDuration(seconds: number): string {
  const safeSeconds = Number(seconds || 0);

  if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) {
    return '0:00';
  }

  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const coverUrl = video.coverUrl || DEFAULT_COVER_URL;

  return (
    <motion.div
      className="group cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800">
        <img
          src={coverUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_COVER_URL;
          }}
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 text-white text-xs rounded">
          {formatDuration(video.duration)}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-3">
        <img
          src={video.uploaderAvatar}
          alt={video.uploaderName}
          loading="lazy"
          className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-gray-200"
          onError={(e) => {
            e.currentTarget.src =
              'https://api.dicebear.com/7.x/avataaars/svg?seed=creator';
          }}
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {video.title}
          </h3>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{video.uploaderName}</span>

            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatCount(video.viewCount)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;