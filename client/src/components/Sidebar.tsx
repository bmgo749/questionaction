import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/categories';
import { Button } from '@/components/ui/button';

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

export function Sidebar() {
  const { t } = useLanguage();

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

  return (
    <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 glow-hover">
          <h2 className="text-lg font-semibold mb-4">{t('sidebar.categories')}</h2>
          <nav className="space-y-2">
            {categories.slice(5).map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors group cursor-pointer">
                  <span className="mr-3 text-sm">{iconMap[category.icon]}</span>
                  <span>{t(`categories.${category.id}`)}</span>
                  <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 glow-hover">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            {t('sidebar.stats')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.articles')}</span>
              <span className="text-sm font-medium">{articles.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.contributors')}</span>
              <span className="text-sm font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('stats.edits')}</span>
              <span className="text-sm font-medium">0</span>
            </div>
          </div>
        </div>

        {/* Create Article Button */}
        <div className="mt-6">
          <Link href="/create-article">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 glow-hover">
              <Plus className="h-4 w-4" />
              <span>{t('common.createArticle')}</span>
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
