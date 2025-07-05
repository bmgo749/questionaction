import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
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

export function CategoryGrid() {
  const { t } = useLanguage();

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {categories.slice(0, 6).map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <div className="bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 cursor-pointer glow-hover">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${colorMap[category.color]}`}>
                  <span className="text-xl">{iconMap[category.icon]}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t(`categories.${category.id}`)}</h3>
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
      
      {/* See All Categories Button */}
      <div className="flex justify-center">
        <Link href="/categories">
          <div className="bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-4 cursor-pointer glow-hover inline-flex items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium mr-2">
              See All Categories
            </span>
            <ArrowRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </div>
        </Link>
      </div>
    </div>
  );
}
