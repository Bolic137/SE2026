import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Video,
  Users,
  MessageSquare,
  Eye,
  Heart,
  Bookmark,
  Loader2,
  Upload,
  PlayCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useVideoStore, Video as VideoItem } from '../stores/videoStore';

const DEFAULT_AVATAR =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=creator';

const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=900&auto=format&fit=crop';

const menuItems = [
  { id: 'overview', label: '数据概览', icon: LayoutDashboard },
  { id: 'content', label: '内容管理', icon: Video },
  { id: 'fans', label: '粉丝管理', icon: Users },
  { id: 'comments', label: '评论管理', icon: MessageSquare },
];

const fallbackWeekData = [
  { day: '周一', views: 12000, fans: 120 },
  { day: '周二', views: 15000, fans: 150 },
  { day: '周三', views: 18000, fans: 180 },
  { day: '周四', views: 14000, fans: 140 },
  { day: '周五', views: 22000, fans: 220 },
  { day: '周六', views: 28000, fans: 280 },
  { day: '周日', views: 25000, fans: 250 },
];

const mockFans = [
  {
    id: '1',
    name: '用户A',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    time: '2026-05-20',
  },
  {
    id: '2',
    name: '用户B',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    time: '2026-05-21',
  },
  {
    id: '3',
    name: 'xuyue',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    time: '2026-05-22',
  },
];

const mockComments = [
  {
    id: '1',
    videoTitle: 'Big Buck Bunny 动画短片投稿',
    content: '讲得太好了，视频可以正常播放！',
    user: '用户A',
    time: '2026-05-20',
  },
  {
    id: '2',
    videoTitle: 'Sintel 电影宣传片',
    content: '弹幕和评论效果都很完整。',
    user: '用户B',
    time: '2026-05-21',
  },
];

function formatCount(count?: number) {
  const safeCount = Number(count || 0);

  if (safeCount >= 10000) {
    return (safeCount / 10000).toFixed(1) + '万';
  }

  return safeCount.toString();
}

function getAuditLabel(status: number) {
  if (status === 1) return '已通过';
  if (status === 2) return '已驳回';
  return '审核中';
}

function getAuditClass(status: number) {
  if (status === 1) return 'bg-green-100 text-green-600';
  if (status === 2) return 'bg-red-100 text-red-600';
  return 'bg-yellow-100 text-yellow-600';
}

function formatDuration(seconds?: number) {
  const safeSeconds = Number(seconds || 0);

  if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) {
    return '0:00';
  }

  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function CreatorPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [creatorVideos, setCreatorVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { user } = useAuthStore();
  const { fetchCreatorVideos } = useVideoStore();

  const loadCreatorVideos = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const list = await fetchCreatorVideos();
      setCreatorVideos(list);
    } catch (error) {
      console.error('获取创作者视频失败:', error);
      setCreatorVideos([]);
      setMessage('获取创作者视频失败，请检查后端是否启动或是否已登录创作者账号。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCreatorVideos();
  }, []);

  const stats = useMemo(() => {
    const totalViews = creatorVideos.reduce(
      (sum, video) => sum + Number(video.viewCount || 0),
      0
    );

    const totalLikes = creatorVideos.reduce(
      (sum, video) => sum + Number(video.likeCount || 0),
      0
    );

    const totalFavorites = creatorVideos.reduce(
      (sum, video) => sum + Number(video.favoriteCount || 0),
      0
    );

    const approvedCount = creatorVideos.filter(
      (video) => video.auditStatus === 1
    ).length;

    const pendingCount = creatorVideos.filter(
      (video) => video.auditStatus === 0
    ).length;

    const rejectedCount = creatorVideos.filter(
      (video) => video.auditStatus === 2
    ).length;

    return {
      totalViews,
      totalLikes,
      totalFavorites,
      totalFans: 45600,
      approvedCount,
      pendingCount,
      rejectedCount,
    };
  }, [creatorVideos]);

  const renderOverview = () => (
    <div className="space-y-6">
      {message && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-blue-500" />
            <span className="text-gray-500">总播放量</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCount(stats.totalViews)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-gray-500">粉丝数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCount(stats.totalFans)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-gray-500">获赞数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCount(stats.totalLikes)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-500">收藏数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCount(stats.totalFavorites)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl">
          <p className="text-sm text-green-600">已通过视频</p>
          <p className="text-2xl font-bold text-green-700">
            {stats.approvedCount}
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-xl">
          <p className="text-sm text-yellow-600">审核中视频</p>
          <p className="text-2xl font-bold text-yellow-700">
            {stats.pendingCount}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl">
          <p className="text-sm text-red-600">已驳回视频</p>
          <p className="text-2xl font-bold text-red-700">
            {stats.rejectedCount}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
          近7天趋势
        </h3>

        <div className="flex items-end gap-2 h-40">
          {fallbackWeekData.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-blue-100 dark:bg-blue-900 rounded-t"
                style={{ height: `${(item.views / 28000) * 100}%` }}
              />
              <span className="text-xs text-gray-500">{item.day}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          当前为课程作业演示数据，视频列表和审核状态来自后端数据库。
        </p>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">内容管理</h3>
          <p className="text-sm text-gray-500">
            查看自己上传的视频及审核状态。
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadCreatorVideos}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            刷新
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            上传视频
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-12 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
          正在加载投稿视频...
        </div>
      ) : creatorVideos.length === 0 ? (
        <div className="px-4 py-12 text-center text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-60" />
          暂无投稿视频，请先到上传页面发布作品。
          <div className="mt-4">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              去上传视频
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                  视频
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                  播放量
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                  点赞
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                  收藏
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                  时间
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                  操作
                </th>
              </tr>
            </thead>

            <tbody>
              {creatorVideos.map((video) => (
                <tr
                  key={video.id}
                  className="border-t border-gray-100 dark:border-gray-700"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={video.coverUrl || DEFAULT_COVER_URL}
                        alt={video.title}
                        className="w-28 h-16 object-cover rounded bg-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_COVER_URL;
                        }}
                      />

                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {video.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {formatDuration(video.duration)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatCount(video.viewCount)}
                  </td>

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatCount(video.likeCount)}
                  </td>

                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatCount(video.favoriteCount)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getAuditClass(
                        video.auditStatus
                      )}`}
                    >
                      {getAuditLabel(video.auditStatus)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(video.uploadTime).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/video/${video.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                    >
                      <PlayCircle className="w-4 h-4" />
                      预览
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderFans = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 dark:text-white mb-3">
        粉丝管理
      </h3>

      {mockFans.map((fan) => (
        <div
          key={fan.id}
          className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
        >
          <img
            src={fan.avatar}
            alt={fan.name}
            className="w-10 h-10 rounded-full"
          />

          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {fan.name}
            </p>
            <p className="text-sm text-gray-500">关注于 {fan.time}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderComments = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h3 className="font-bold text-gray-900 dark:text-white mb-3">
        评论管理
      </h3>

      {mockComments.map((comment) => (
        <div
          key={comment.id}
          className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
        >
          <p className="text-sm text-gray-500 mb-1">
            视频：{comment.videoTitle}
          </p>

          <p className="font-medium text-gray-900 dark:text-white">
            {comment.content}
          </p>

          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <span>{comment.user}</span>
            <span>{comment.time}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMainContent = () => {
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'content') return renderContent();
    if (activeTab === 'fans') return renderFans();
    if (activeTab === 'comments') return renderComments();

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <img
                src={user?.avatar || DEFAULT_AVATAR}
                alt={user?.nickname || '创作者'}
                className="w-12 h-12 rounded-full bg-gray-200"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />

              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user?.nickname || '创作者'}
                </p>
                <p className="text-sm text-gray-500">创作者</p>
              </div>
            </div>

            <nav className="grid grid-cols-2 md:grid-cols-1 gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {renderMainContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CreatorPage;