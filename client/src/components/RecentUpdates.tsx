import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/categories';

interface RecentUpdate {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  author: string;
  color: string;
}

const recentUpdates: RecentUpdate[] = [];

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

  const categoryOptions = [
    { id: 'globe', name: t('categories.globe'), icon: '🌍' },
    ...categories.map(cat => ({
      id: cat.id,
      name: t(`categories.${cat.id}`),
      icon: getIconForCategory(cat.icon)
    }))
  ];

  function getIconForCategory(iconName: string): string {
    const iconMap: Record<string, string> = {
      globe: '🌍',
      history: '📚',
      flask: '🧪',
      map: '🗺️',
      running: '🏃',
      film: '🎬',
      landmark: '🏛️',
      microchip: '💻',
      heartbeat: '❤️',
      'graduation-cap': '🎓',
    };
    return iconMap[iconName] || '📄';
  }

  const selectedOption = categoryOptions.find(opt => opt.id === selectedCategory);

  return (
    <div className={`bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 transition-all duration-3000 glow-hover ${
      isShimmering ? 'animate-shimmer' : ''
    }`}>
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
            <span className="text-lg">{selectedOption?.icon}</span>
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
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Empty State */}
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
    </div>
  );
}
