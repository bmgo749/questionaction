import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { categories } from '@/data/categories';

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
};

export default function Categories() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Explore all available categories and discover interesting content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <div className="bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 cursor-pointer glow-hover">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${colorMap[category.color]}`}>
                    <span className="text-xl">{iconMap[category.icon]}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t(`categories.${category.id}`)}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.articleCount} articles
                    </p>
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
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}