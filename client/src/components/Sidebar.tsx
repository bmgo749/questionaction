import { ArrowRight, Plus, Star } from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/categories';
import { useCategoryCounts } from '@/hooks/useCategoryCounts';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const { t } = useLanguage();
  const onlineUsers = useOnlineUsers();
  const { user } = useAuth();
  const { data: categoryCounts, isLoading: countsLoading } = useCategoryCounts();

  const { data: articles = [] } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    },
    refetchInterval: 3000, // Refresh every 3 seconds
  });



  return (
    <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
      <div>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('sidebar.categories')}</h2>
          <nav className="space-y-2">
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group">
              <Star className="mr-2 h-4 w-4 text-green-500" />
              <span className="flex-1">Post Video</span>
            </div>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group">
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              <span className="flex-1">Message another People</span>
            </div>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group">
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              <span className="flex-1">Test your IQ</span>
            </div>
            <SecureLink href="/create-article">
              <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group cursor-pointer">
                <Star className="mr-2 h-4 w-4 text-green-500" />
                <span className="flex-1">Post Article</span>
                <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </SecureLink>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group">
              <Star className="mr-2 h-4 w-4 text-blue-500" />
              <span className="flex-1">Searching Feature</span>
            </div>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group">
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              <span className="flex-1">Honor, Badge, or etc Feature</span>
            </div>
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            {t('sidebar.stats')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.articles')}</span>
              <span className="text-sm font-medium">{articles.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('welcome.visitors')}</span>
              <span className="text-sm font-medium">{onlineUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.edits')}</span>
              <span className="text-sm font-medium">0</span>
            </div>
          </div>
        </div>




      </div>
    </aside>
  );
}


