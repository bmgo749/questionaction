import { ArrowRight } from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/categories';
import { LoadingScreen } from './LoadingScreen';
import { useCategoryCounts } from '@/hooks/useCategoryCounts';

const colorMap: Record<string, string> = {
  'blue-600': 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400',
  'amber-600': 'bg-gray-100 dark:bg-gray-700 text-amber-600 dark:text-amber-400',
  'green-600': 'bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400',
  'purple-600': 'bg-gray-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400',
  'red-600': 'bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400',
  'pink-600': 'bg-gray-100 dark:bg-gray-700 text-pink-600 dark:text-pink-400',
  'indigo-600': 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400',
  'cyan-600': 'bg-gray-100 dark:bg-gray-700 text-cyan-600 dark:text-cyan-400',
  'emerald-600': 'bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400',
  'orange-600': 'bg-gray-100 dark:bg-gray-700 text-orange-600 dark:text-orange-400',
  'violet-600': 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400',
};

const textColorMap: Record<string, string> = {
  'blue-600': 'text-blue-600 dark:text-blue-400',
  'amber-600': 'text-amber-600 dark:text-amber-400',
  'green-600': 'text-green-600 dark:text-green-400',
  'purple-600': 'text-purple-600 dark:text-purple-400',
  'red-600': 'text-red-600 dark:text-red-400',
  'pink-600': 'text-pink-600 dark:text-pink-400',
  'indigo-600': 'text-indigo-600 dark:text-indigo-400',
  'cyan-600': 'text-cyan-600 dark:text-cyan-400',
  'emerald-600': 'text-emerald-600 dark:text-emerald-400',
  'orange-600': 'text-orange-600 dark:text-orange-400',
  'violet-600': 'text-violet-600 dark:text-violet-400',
};

export function CategoryGrid() {
  const { t } = useLanguage();
  const [showLoading, setShowLoading] = useState(false);
  const [isShimmering, setIsShimmering] = useState(false);
  const { data: categoryCounts = {}, isLoading: countsLoading } = useCategoryCounts();

  const handleSeeAllCategories = () => {
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
    window.location.href = '/categories';
  };

  // Efek mengkilau yang berulang setiap 30 detik
  useEffect(() => {
    const startShimmer = () => {
      setIsShimmering(true);
      setTimeout(() => setIsShimmering(false), 3000);
    };

    // Mulai shimmer pertama setelah 1 detik
    const initialTimer = setTimeout(startShimmer, 1000);
    
    // Ulang setiap 30 detik
    const intervalTimer = setInterval(startShimmer, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {categories.slice(0, 6).map((category) => {
          // Add fade effect for Sports and Entertainment categories
          const isFaded = category.id === 'sports' || category.id === 'entertainment';
          const cardClasses = isFaded 
            ? "bg-black dark:bg-black rounded-lg border border-black p-6 cursor-pointer glow-hover opacity-50 hover:opacity-100 transition-opacity duration-300"
            : "bg-black dark:bg-black rounded-lg border border-black p-6 cursor-pointer glow-hover";
          
          return (
            <SecureLink key={category.id} href={`/category/${category.slug}`}>
              <div className={cardClasses}>
                <div className="flex items-center mb-4">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 min-w-[3rem] mr-4">
                    {countsLoading ? "..." : (categoryCounts[category.id] || 0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(`categories.${category.id}`)}</h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {t(`categoryDescriptions.${category.id}`)}
                </p>
                <div className={`flex items-center text-sm font-medium ${textColorMap[category.color]}`}>
                  <span>{t('common.explore')}</span>
                  <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </div>
            </SecureLink>
          );
        })}
      </div>
      
      {/* See All Categories Button */}
      <div className="flex justify-center">
        <div 
          onClick={handleSeeAllCategories}
          className={`bg-black dark:bg-black rounded-lg border border-black dark:border-gray-800 p-4 cursor-pointer glow-hover inline-flex items-center ${isShimmering ? 'shimmer-button' : ''}`}
        >
          <span className="text-white dark:text-white font-medium mr-2">
            {t('common.seeAllCategories')}
          </span>
          <ArrowRight className="h-4 w-4 text-white dark:text-white" />
        </div>
      </div>
    </div>
  );
}
