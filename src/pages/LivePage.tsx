import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Send,
  Heart,
  Share2,
  Maximize,
  Volume2,
  VolumeX,
  Loader2,
  Radio,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveStore } from '../stores/liveStore';
import { useAuthStore } from '../stores/authStore';

const DEFAULT_LIVE_VIDEO = '/demo-videos/video1.mp4';
const BACKUP_LIVE_VIDEO = '/demo-videos/video2.mp4';

const DEFAULT_AVATAR =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=creator';

function getPlayableLiveUrl(url?: string) {
  if (!url) return DEFAULT_LIVE_VIDEO;

  const cleanUrl = String(url).trim();
  const lower = cleanUrl.toLowerCase();

  if (
    lower.includes('.mp4') ||
    lower.includes('.webm') ||
    lower.includes('.ogg')
  ) {
    return cleanUrl;
  }

  // 课程作业演示版：如果后端给的是 flv / rtmp，浏览器原生 video 无法直接播放，使用 mp4 演示源兜底
  return DEFAULT_LIVE_VIDEO;
}

export function LivePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const [chatInput, setChatInput] = useState('');
  const [chatColor, setChatColor] = useState('#FFFFFF');
  const [isMuted, setIsMuted] = useState(true);
  const [showDanmaku, setShowDanmaku] = useState(true);
  const [danmakuList, setDanmakuList] = useState<
    { id: string; content: string; color: string; top: number }[]
  >([]);

  const {
    currentRoom,
    messages,
    onlineCount,
    isConnected,
    isLoading,
    fetchRoomDetail,
    connectWebSocket,
    disconnectWebSocket,
    sendDanmaku,
  } = useLiveStore();

  const { isLoggedIn, user, openLoginModal } = useAuthStore();

  useEffect(() => {
    if (!roomId) return;

    fetchRoomDetail(roomId);
    connectWebSocket(roomId);

    return () => {
      disconnectWebSocket();
    };
  }, [roomId, fetchRoomDetail, connectWebSocket, disconnectWebSocket]);

  useEffect(() => {
    if (!chatRef.current) return;

    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const danmakuMessages = messages.filter((message) => message.type === 'danmaku');

    if (danmakuMessages.length === 0) return;

    const latest = danmakuMessages[danmakuMessages.length - 1];

    const newDanmaku = {
      id: `${latest.id}-${Date.now()}`,
      content: latest.content,
      color: latest.color || '#FFFFFF',
      top: Math.random() * 60 + 10,
    };

    setDanmakuList((prev) => [...prev.slice(-20), newDanmaku]);

    const timer = window.setTimeout(() => {
      setDanmakuList((prev) => prev.filter((item) => item.id !== newDanmaku.id));
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [messages]);

  const safeLiveUrl = getPlayableLiveUrl(currentRoom?.pullUrl);

  const visibleMessages =
    messages.length > 0
      ? messages
      : [
          {
            id: 'mock-system-1',
            type: 'system' as const,
            content: '欢迎来到直播间，当前为课程作业演示直播。',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'mock-danmaku-1',
            type: 'danmaku' as const,
            content: '这个直播间可以聊天互动！',
            color: '#4ECDC4',
            position: 0,
            username: 'xuyue',
            userId: '1',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'mock-danmaku-2',
            type: 'danmaku' as const,
            content: '直播页面展示效果不错',
            color: '#FFE66D',
            position: 0,
            username: '观众A',
            userId: '2',
            timestamp: new Date().toISOString(),
          },
        ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    sendDanmaku(chatInput.trim(), chatColor, 0);
    setChatInput('');
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('直播间链接已复制');
    } catch {
      alert('复制失败，请手动复制浏览器地址');
    }
  };

  if (isLoading && !currentRoom) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-500" />
          正在加载直播间...
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          <Radio className="w-14 h-14 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            直播间加载失败
          </h2>
          <p className="text-gray-500 mb-6">
            请返回直播列表重新选择直播间。
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回发现页
          </button>
        </div>
      </div>
    );
  }

  const displayOnlineCount = Number(onlineCount || currentRoom.onlineCount || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
              key={`${currentRoom.id}-${safeLiveUrl}`}
              ref={videoRef}
              src={safeLiveUrl}
              className="w-full h-full bg-black object-contain"
              muted={isMuted}
              playsInline
              controls
              poster={currentRoom.cover}
              preload="metadata"
              onError={(e) => {
                const target = e.currentTarget;

                console.warn('直播视频加载失败，当前地址:', target.src);

                if (!target.src.includes('BigBuckBunny.mp4')) {
                  target.src = DEFAULT_LIVE_VIDEO;
                  target.load();
                  return;
                }

                if (!target.src.includes('ElephantsDream.mp4')) {
                  target.src = BACKUP_LIVE_VIDEO;
                  target.load();
                }
              }}
            />

            {showDanmaku && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <AnimatePresence>
                  {danmakuList.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ x: '100%', opacity: 1 }}
                      animate={{ x: '-100%' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 6, ease: 'linear' }}
                      className="absolute text-lg font-medium whitespace-nowrap"
                      style={{
                        color: item.color,
                        top: `${item.top}%`,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      {item.content}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {danmakuList.length === 0 &&
                  visibleMessages
                    .filter((message) => message.type === 'danmaku')
                    .slice(0, 3)
                    .map((message, index) => (
                      <div
                        key={`static-${message.id}`}
                        className="absolute text-base md:text-lg font-medium whitespace-nowrap"
                        style={{
                          color: message.color || '#ffffff',
                          top: `${10 + index * 12}%`,
                          left: `${10 + index * 16}%`,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        {message.content}
                      </div>
                    ))}
              </div>
            )}

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 text-white text-sm font-bold rounded-full ${
                  currentRoom.status === 1
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gray-500'
                }`}
              >
                {currentRoom.status === 1 ? 'LIVE' : '已结束'}
              </span>

              <span className="px-3 py-1 bg-black/50 text-white text-sm rounded-full flex items-center gap-1">
                <Users className="w-4 h-4" />
                {displayOnlineCount.toLocaleString()}
              </span>

              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  isConnected
                    ? 'bg-green-500/90 text-white'
                    : 'bg-black/50 text-white'
                }`}
              >
                {isConnected ? '聊天已连接' : '本地演示'}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setShowDanmaku((prev) => !prev)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  showDanmaku
                    ? 'bg-blue-500 text-white'
                    : 'bg-black/50 text-white'
                }`}
              >
                弹幕
              </button>

              <button
                onClick={handleFullscreen}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex gap-4">
                <img
                  src={currentRoom.anchorAvatar || DEFAULT_AVATAR}
                  alt={currentRoom.anchorName}
                  className="w-14 h-14 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />

                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentRoom.title}
                  </h1>

                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>{currentRoom.anchorName}</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {currentRoom.categoryName}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    当前为课程作业演示直播。真实推流可后续接入 SRS / WebRTC / OBS。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <Heart className="w-4 h-4" />
                  关注
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              直播间聊天
            </h3>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {displayOnlineCount}
            </div>
          </div>

          <div
            ref={chatRef}
            className="h-96 overflow-y-auto p-4 space-y-2 scrollbar-thin"
          >
            {visibleMessages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'system' && (
                  <p className="text-center text-xs text-gray-400 py-1">
                    {msg.content}
                  </p>
                )}

                {msg.type === 'danmaku' && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                      {msg.username || '观众'}:
                    </span>

                    <span
                      className="text-sm break-all"
                      style={{ color: msg.color || '#ffffff' }}
                    >
                      {msg.content}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {['#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'].map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() => setChatColor(color)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          chatColor === color
                            ? 'border-gray-800 dark:border-white'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="发弹幕..."
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">登录后参与聊天</p>

                <button
                  onClick={openLoginModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  去登录
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LivePage;