import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/categories';
import { format } from 'date-fns';
import { SecureLink } from '@/components/SecureRouter';

interface TrendingArticle {
  id: number;
  title: string;
  content?: string;
  categories?: string[];
  likes: number;
  author: string;
  authorName?: string;
  createdAt: string;
  description?: string;
  category?: string;
  type?: string;
}

export function RecentUpdates() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('globe');
  const [isShimmering, setIsShimmering] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Stop shimmering after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShimmering(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch trending articles based on selected category
  const { data: trendingArticles = [] } = useQuery({
    queryKey: [`/api/articles/trending${selectedCategory === 'globe' ? '' : `/${selectedCategory}`}`],
    queryFn: async () => {
      const url = selectedCategory === 'globe' 
        ? '/api/recent-updates' 
        : `/api/articles/trending/${selectedCategory}`;
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }
      return response.json();
    },
  });

  const categoryOptions = [
    { id: 'globe', name: t('categories.globe'), color: 'blue-600' },
    ...categories.map(cat => ({
      id: cat.id,
      name: t(`categories.${cat.id}`),
      color: cat.color
    }))
  ];

  const selectedOption = categoryOptions.find(opt => opt.id === selectedCategory);

  // Color mapping for display
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue-600': 'bg-blue-600',
      'amber-600': 'bg-amber-600',
      'green-600': 'bg-green-600',
      'purple-600': 'bg-purple-600',
      'red-600': 'bg-red-600',
      'pink-600': 'bg-pink-600',
      'indigo-600': 'bg-indigo-600',
      'cyan-600': 'bg-cyan-600',
      'emerald-600': 'bg-emerald-600',
      'orange-600': 'bg-orange-600',
      'violet-600': 'bg-violet-600',
    };
    return colorMap[color] || 'bg-gray-600';
  };

  return (
    <div className={`bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 transition-all glow-hover ${
      isShimmering ? 'animate-shimmer' : ''
    }`} style={{ transitionDuration: '3000ms' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-full bg-white dark:bg-transparent p-1 dark:p-0 border border-black dark:border-none">
            <img 
              src="/attached_assets/Tak berjudul383_20250704194138_1751629685716.png" 
              alt="QuestionAction logo" 
              className="w-full h-full object-contain filter invert dark:invert-0"
            />
          </div>
          <h2 className="text-xl font-semibold">{t('recent.title')}</h2>
        </div>
        
        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <div className={`w-4 h-4 rounded-full ${getColorClasses(selectedOption?.color || 'blue-600')}`}></div>
            <span>{selectedOption?.name}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-black dark:border-gray-700 z-10">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSelectedCategory(option.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    option.id === selectedCategory ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  } first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2`}
                >
                  <div className={`w-4 h-4 rounded-full ${getColorClasses(option.color)}`}></div>
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Trending Articles Content */}
      <div className="space-y-6">
        {trendingArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('recent.empty.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              {selectedCategory === 'globe' 
                ? t('recent.empty.globe') 
                : t('recent.empty.category')
              }
            </p>
          </div>
        ) : (
          trendingArticles.slice(0, 2).map((article: TrendingArticle, index: number) => (
            <SecureLink key={`trending-${article.id}-${index}`} href={`/article/${article.id}`}>
              <div className="mb-6">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {article.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        #{index + 1} Trending
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {article.description || 
                       (article.content && article.content.length > 100 ? 
                        article.content.substring(0, 100) + '...' : 
                        article.content) || 
                       'Article content preview is not available'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {article.authorName || article.author || 'Unknown Author'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {article.likes || 0} likes
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {article.category || article.categories?.[0] || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SecureLink>
          ))
        )}
      </div>
    </div>
  );
}
