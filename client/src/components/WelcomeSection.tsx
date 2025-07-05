import { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeSectionProps {
  onSearch?: (term: string) => void;
}

export function WelcomeSection({ onSearch }: WelcomeSectionProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: articles = [] } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      setIsSearching(true);
      
      // Simulate search with animation
      setTimeout(() => {
        setIsSearching(false);
        console.log('Searching for:', searchTerm);
      }, 2000);
    }
  };

  if (isSearching) {
    return (
      <div className="bg-gray-100 dark:bg-black rounded-lg p-8 mb-8 text-gray-900 dark:text-white border border-black dark:border-gray-800">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-transparent p-2 dark:p-0 border border-black dark:border-none animate-bounce">
              <img 
                src="/attached_assets/Tak berjudul383_20250704194138_1751629685716.png" 
                alt="QuestionAction logo" 
                className="w-full h-full object-contain filter invert dark:invert-0"
              />
            </div>
          </div>
          <div className="text-lg font-medium animate-fade-in">
            {t('search.searching')} "{searchTerm}"...
          </div>
          <div className="mt-4 w-48 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-black rounded-lg p-8 mb-8 text-gray-900 dark:text-white border border-black dark:border-gray-800">
      
      <h1 className="text-3xl font-bold mb-4">{t('welcome.title')}</h1>
      <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">{t('welcome.subtitle')}</p>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search.placeholder')}
            className="block w-full pl-10 pr-4 py-3 bg-gray-200 dark:bg-gray-800 border border-black dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
              {t('search.button')}
            </div>
          </button>
        </div>
      </form>
      <div className="flex flex-wrap gap-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 border border-black dark:border-gray-600 glow-hover">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">10</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('welcome.categories')}</div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 border border-black dark:border-gray-600 glow-hover">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{t('welcome.articles')}</div>
        </div>
      </div>
    </div>
  );
}
