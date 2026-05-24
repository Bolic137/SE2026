import React, { useEffect, useState } from 'react';
import {
  Video,
  Users,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVideoStore, Video as VideoItem } from '../stores/videoStore';

const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=900&auto=format&fit=crop';

const menuItems = [
  { id: 'videos', label: '视频审核', icon: Video },
  { id: 'users', label: '用户管理', icon: Users },
  { id: 'reports', label: '举报处理', icon: AlertTriangle },
  { id: 'sensitive', label: '敏感词管理', icon: Shield },
];

const mockUsers = [
  {
    id: '1',
    nickname: '管理员',
    account: 'admin',
    status: 0,
    role: '管理员',
  },
  {
    id: '2',
    nickname: '创作者小明',
    account: 'creator',
    status: 0,
    role: '创作者',
  },
  {
    id: '3',
    nickname: '普通用户 xuyue',
    account: 'user',
    status: 0,
    role: '普通用户',
  },
];

const mockReports = [
  {
    id: '1',
    videoTitle: '测试视频：评论区存在不友好内容',
    reporter: '用户C',
    reason: '评论区出现攻击性语言',
    status: 0,
  },
  {
    id: '2',
    videoTitle: '测试视频：疑似搬运内容',
    reporter: '用户D',
    reason: '疑似未经授权转载',
    status: 0,
  },
];

const mockWords = [
  { id: '1', word: '脏话1', level: 1 },
  { id: '2', word: '脏话2', level: 2 },
  { id: '3', word: '违禁词', level: 3 },
];

function getAuditLabel(status: number) {
  if (status === 1) return '已通过';
  if (status === 2) return '已驳回';
  return '待审核';
}

function getAuditClass(status: number) {
  if (status === 1) return 'bg-green-100 text-green-700';
  if (status === 2) return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
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

export function AdminPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('videos');
  const [pendingVideos, setPendingVideos] = useState<VideoItem[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newLevel, setNewLevel] = useState(1);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const { fetchPendingVideos, auditVideo } = useVideoStore();

  const loadPending = async () => {
    setIsLoadingVideos(true);
    setMessage('');

    try {
      const list = await fetchPendingVideos();
      setPendingVideos(list);
    } catch (error) {
      console.error('加载待审核视频失败:', error);
      setMessage('加载待审核视频失败，请检查后端是否启动。');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'videos') {
      loadPending();
    }
  }, [activeTab]);

  const handleAudit = async (videoId: string, status: number) => {
    setAuditingId(videoId);
    setMessage('');

    try {
      await auditVideo(videoId, status);
      await loadPending();

      setMessage(status === 1 ? '视频已通过审核。' : '视频已驳回。');
    } catch (error) {
      console.error('审核失败:', error);
      setMessage('审核失败，请检查管理员登录状态或后端接口。');
    } finally {
      setAuditingId(null);
    }
  };

  const handleAddWord = () => {
    if (!newWord.trim()) return;

    alert(`已模拟添加敏感词：${newWord}，等级：${newLevel}`);

    setNewWord('');
    setNewLevel(1);
  };

  const renderVideosTab = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              视频审核
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              待审核视频：{pendingVideos.length} 个。通过后视频会出现在首页推荐流中。
            </p>
          </div>

          <button
            onClick={loadPending}
            disabled={isLoadingVideos}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
          >
            {isLoadingVideos ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            刷新
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
            {message}
          </div>
        )}

        {isLoadingVideos && (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
            正在加载待审核视频...
          </div>
        )}

        {!isLoadingVideos && pendingVideos.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg text-gray-500">
            暂无待审核视频
            <p className="text-xs mt-2">
              你可以使用 creator / creator123 登录后上传视频，再回到管理员后台审核。
            </p>
          </div>
        )}

        {!isLoadingVideos &&
          pendingVideos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <div className="relative w-full md:w-40 aspect-video rounded overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={video.coverUrl || DEFAULT_COVER_URL}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COVER_URL;
                  }}
                />

                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                  {formatDuration(video.duration)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {video.title}
                  </h3>

                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${getAuditClass(
                      video.auditStatus
                    )}`}
                  >
                    {getAuditLabel(video.auditStatus)}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  上传者：{video.uploaderName || '未知创作者'}
                </p>

                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {video.description || '暂无简介'}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {video.tags?.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col lg:flex-row gap-2">
                <button
                  onClick={() => navigate(`/video/${video.id}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="预览"
                >
                  <Eye size={22} />
                </button>

                <button
                  onClick={() => handleAudit(video.id, 1)}
                  disabled={auditingId === video.id}
                  className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                  title="通过"
                >
                  {auditingId === video.id ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <CheckCircle size={22} />
                  )}
                </button>

                <button
                  onClick={() => handleAudit(video.id, 2)}
                  disabled={auditingId === video.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  title="驳回"
                >
                  <XCircle size={22} />
                </button>
              </div>
            </div>
          ))}
      </div>
    );
  };

  const renderUsersTab = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          用户管理
        </h2>

        {mockUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg"
          >
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {user.nickname}
              </h3>

              <p className="text-sm text-gray-500">
                {user.account} · {user.role}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                user.status === 0
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {user.status === 0 ? '正常' : '封禁'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderReportsTab = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          举报处理
        </h2>

        {mockReports.map((report) => (
          <div
            key={report.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {report.videoTitle}
                </h3>

                <p className="text-sm text-gray-500">举报者：{report.reporter}</p>
                <p className="text-sm text-gray-500">原因：{report.reason}</p>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">
                  处理
                </button>

                <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm">
                  忽略
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSensitiveTab = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          敏感词管理
        </h2>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="输入敏感词"
            className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          />

          <select
            value={newLevel}
            onChange={(e) => setNewLevel(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          >
            <option value={1}>替换</option>
            <option value={2}>屏蔽</option>
            <option value={3}>禁止</option>
          </select>

          <button
            onClick={handleAddWord}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            添加
          </button>
        </div>

        {mockWords.map((word) => (
          <div
            key={word.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {word.word}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                word.level === 1
                  ? 'bg-yellow-100 text-yellow-600'
                  : word.level === 2
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-red-100 text-red-600'
              }`}
            >
              {word.level === 1
                ? '替换'
                : word.level === 2
                  ? '屏蔽'
                  : '禁止'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'videos':
        return renderVideosTab();
      case 'users':
        return renderUsersTab();
      case 'reports':
        return renderReportsTab();
      case 'sensitive':
        return renderSensitiveTab();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          管理后台
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 grid grid-cols-2 md:grid-cols-1 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;