import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  X,
  Film,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoStore } from '../stores/videoStore';
import { useNavigate } from 'react-router-dom';

const DEFAULT_VIDEO_URL =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=900&auto=format&fit=crop';

const DEMO_VIDEO_OPTIONS = [
  {
    label: 'Big Buck Bunny 动画短片',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    label: 'Sintel 电影宣传片',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
  {
    label: 'Tears of Steel 科幻短片',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  },
  {
    label: 'Elephants Dream 开源动画',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
];

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const { uploadVideo, categories, fetchCategories } = useVideoStore();

  const [step, setStep] = useState<'select' | 'uploading' | 'info' | 'success'>(
    'select'
  );

  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [tags, setTags] = useState<string[]>(['投稿', '视频']);
  const [tagInput, setTagInput] = useState('');
  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER_URL);
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [duration, setDuration] = useState(596);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const normalCategories =
    categories && categories.length > 0
      ? categories.filter((category) => category.type === 0)
      : [
          { id: '1', name: '推荐', type: 0 },
          { id: '2', name: '影视', type: 0 },
          { id: '3', name: '动画', type: 0 },
          { id: '4', name: '科技', type: 0 },
          { id: '5', name: '学习', type: 0 },
          { id: '6', name: '生活', type: 0 },
        ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!title.trim()) {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(fileName || '我的投稿视频');
    }

    setStep('uploading');
    simulateUpload();
  };

  const simulateUpload = () => {
    let value = 0;
    setProgress(0);

    const interval = window.setInterval(() => {
      value += 10;
      setProgress(value);

      if (value >= 100) {
        window.clearInterval(interval);
        setStep('info');

        if (!coverUrl) {
          setCoverUrl(DEFAULT_COVER_URL);
        }

        if (!videoUrl) {
          setVideoUrl(DEFAULT_VIDEO_URL);
        }
      }
    }, 180);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();

    const value = tagInput.trim();

    if (!value) return;
    if (tags.includes(value)) {
      setTagInput('');
      return;
    }
    if (tags.length >= 10) return;

    setTags((prev) => [...prev, value]);
    setTagInput('');
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectDemoVideo = (url: string) => {
    setVideoUrl(url);

    if (url.includes('Sintel')) {
      setDuration(888);
      setTitle((prev) => prev || 'Sintel 电影宣传片');
      setCoverUrl('https://download.blender.org/durian/trailer/sintel_trailer-480p.jpg');
    } else if (url.includes('TearsOfSteel')) {
      setDuration(734);
      setTitle((prev) => prev || 'Tears of Steel 科幻短片');
      setCoverUrl('https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg');
    } else if (url.includes('ElephantsDream')) {
      setDuration(653);
      setTitle((prev) => prev || 'Elephants Dream 开源动画');
      setCoverUrl('https://orange.blender.org/wp-content/themes/orange/images/media/gallery/s1_proog.jpg');
    } else {
      setDuration(596);
      setTitle((prev) => prev || 'Big Buck Bunny 动画短片');
      setCoverUrl('https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('请填写视频标题');
      return;
    }

    if (!categoryId) {
      alert('请选择分类');
      return;
    }

    setIsSubmitting(true);

    const success = await uploadVideo({
      title: title.trim(),
      description: description.trim() || '这是一个由创作者上传的视频。',
      categoryId,
      tags: tags.length > 0 ? tags : ['投稿', '视频'],
      coverUrl: coverUrl.trim() || DEFAULT_COVER_URL,
      videoUrl: videoUrl.trim() || DEFAULT_VIDEO_URL,
      duration: Number(duration) || 596,
    });

    setIsSubmitting(false);

    if (success) {
      setStep('success');
    } else {
      alert('上传失败，请检查后端是否启动或重新登录创作者账号');
    }
  };

  const resetForm = () => {
    setStep('select');
    setProgress(0);
    setTitle('');
    setDescription('');
    setCategoryId('1');
    setTags(['投稿', '视频']);
    setTagInput('');
    setCoverUrl(DEFAULT_COVER_URL);
    setVideoUrl(DEFAULT_VIDEO_URL);
    setDuration(596);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          上传视频
        </h1>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                点击或拖拽视频至此
              </h3>

              <p className="text-sm text-gray-500">
                课程作业演示版：选择文件后会模拟上传进度，实际播放使用网络 mp4 示例视频
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTitle('Big Buck Bunny 动画短片投稿');
                  setDescription('这是一个用于课程作业展示的视频投稿。');
                  setStep('info');
                }}
                className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                不选择文件，直接使用演示视频
              </button>
            </motion.div>
          )}

          {step === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <Film className="w-8 h-8 text-blue-500" />

                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      正在上传...
                    </span>

                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>

                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                当前为课程作业演示上传，不会真正上传大文件到服务器。
              </p>
            </motion.div>
          )}

          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 space-y-6"
            >
              <div className="flex gap-4">
                <div className="w-40 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt="cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_COVER_URL;
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-full h-full p-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    标题 *
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="2-100字"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  简介
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="介绍一下你的视频内容..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  分类 *
                </label>

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {normalCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  选择演示视频源
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_VIDEO_OPTIONS.map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => handleSelectDemoVideo(item.url)}
                      className={`px-3 py-2 text-left text-sm rounded-lg border ${
                        videoUrl === item.url
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  视频链接
                </label>

                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="请输入可播放的 mp4 链接"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  建议使用 .mp4 链接，否则系统会自动使用默认演示视频。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  封面链接
                </label>

                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="请输入封面图片链接"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  时长，单位秒
                </label>

                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 596)}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  标签
                </label>

                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="回车添加标签，最多10个"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  取消
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!title.trim() || !categoryId || isSubmitting}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? '发布中...' : '发布并等待审核'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                投稿成功，等待管理员审核
              </h2>

              <p className="text-gray-500 mb-6">
                审核通过后，视频会出现在首页推荐列表中。
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/creator')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  去创作者中心
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  回到首页
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UploadPage;