import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music2, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface ShortVideo {
  id: string;
  videoUrl: string;
  coverUrl: string;
  title: string;
  uploaderName: string;
  uploaderAvatar: string;
  likeCount: number;
  commentCount: number;
  music: string;
}

const mockShortVideos: ShortVideo[] = [
  {
    id: '1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=700&fit=crop',
    title: '精彩游戏瞬间',
    uploaderName: '游戏达人',
    uploaderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamer',
    likeCount: 1234,
    commentCount: 56,
    music: '热门游戏BGM'
  },
  {
    id: '2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&h=700&fit=crop',
    title: '音乐分享',
    uploaderName: '音乐爱好者',
    uploaderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=music',
    likeCount: 5678,
    commentCount: 234,
    music: '流行歌曲'
  },
  {
    id: '3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=700&fit=crop',
    title: '生活日常',
    uploaderName: '生活记录者',
    uploaderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=life',
    likeCount: 890,
    commentCount: 45,
    music: '轻松音乐'
  }
];

export function ShortVideoPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const currentVideo = mockShortVideos[currentIndex];

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.play().catch(() => {
            // 自动播放被阻止，等待用户交互
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [currentIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < mockShortVideos.length) {
      setCurrentIndex(newIndex);
    }
  };

  const toggleLike = () => {
    if (!isLoggedIn) return;
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentVideo.id)) {
        newSet.delete(currentVideo.id);
      } else {
        newSet.add(currentVideo.id);
      }
      return newSet;
    });
  };

  const formatCount = (count: number) => {
    if (count >= 10000) return (count / 10000).toFixed(1) + 'w';
    return count.toString();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full text-white"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {mockShortVideos.map((video, index) => (
          <div
            key={video.id}
            className="h-full snap-start relative flex items-center justify-center"
          >
            <video
              ref={el => videoRefs.current[index] = el}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              loop
              playsInline
              muted
              onClick={() => setIsPlaying(!isPlaying)}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

            <div className="absolute bottom-20 left-4 right-20 text-white">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={video.uploaderAvatar}
                  alt={video.uploaderName}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="font-medium">{video.uploaderName}</span>
              </div>
              <p className="text-sm mb-2">{video.title}</p>
              <div className="flex items-center gap-2 text-xs opacity-80">
                <Music2 className="w-4 h-4" />
                <span>{video.music}</span>
              </div>
            </div>

            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
              <button
                onClick={toggleLike}
                className="flex flex-col items-center gap-1"
              >
                <motion.div
                  whileTap={{ scale: 1.2 }}
                  className={`p-3 rounded-full ${likedVideos.has(video.id) ? 'bg-red-500' : 'bg-black/30'}`}
                >
                  <Heart
                    className={`w-6 h-6 ${likedVideos.has(video.id) ? 'text-white fill-white' : 'text-white'}`}
                  />
                </motion.div>
                <span className="text-white text-xs">
                  {formatCount(video.likeCount + (likedVideos.has(video.id) ? 1 : 0))}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1">
                <div className="p-3 bg-black/30 rounded-full">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs">{formatCount(video.commentCount)}</span>
              </button>

              <button className="flex flex-col items-center gap-1">
                <div className="p-3 bg-black/30 rounded-full">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs">分享</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
