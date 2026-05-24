import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { VideoCard } from '../components/video/VideoCard';
import { useVideoStore } from '../stores/videoStore';

const sortOptions = [
  { value: 'comprehensive', label: '综合' },
  { value: 'latest', label: '最新' },
  { value: 'hottest', label: '最热' },
];

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';

  const [sort, setSort] = useState('comprehensive');
  const [inputKeyword, setInputKeyword] = useState(keyword);

  const { searchResults, searchVideos, isLoading } = useVideoStore();

  useEffect(() => {
    setInputKeyword(keyword);

    if (keyword.trim()) {
      searchVideos(keyword.trim(), sort);
    }
  }, [keyword, sort, searchVideos]);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const value = inputKeyword.trim();

    if (!value) return;

    setSearchParams({ keyword: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative max-w-xl">
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              placeholder="搜索视频、直播、创作者..."
              className="w-full h-11 pl-11 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </form>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-gray-500" />

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {keyword.trim() ? `"${keyword}" 的搜索结果` : '搜索视频'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />

            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sort === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : keyword.trim() && searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {searchResults.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index * 0.03, 0.3),
                }}
              >
                <VideoCard
                  video={video}
                  onClick={() => navigate(`/video/${video.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="w-16 h-16 mb-4 opacity-50" />

            <p className="text-lg">
              {keyword.trim() ? '暂无相关视频' : '请输入关键词搜索'}
            </p>

            <p className="text-sm mt-2">
              {keyword.trim() ? '换个关键词试试吧' : '例如：动画、科技、学习'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;