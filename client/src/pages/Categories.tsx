import { ArrowRight } from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { categories } from '@/data/categories';
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

export default function Categories() {
  const { t } = useLanguage();
  const { data: categoryCounts, isLoading: countsLoading } = useCategoryCounts();

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
            <SecureLink key={category.id} href={`/category/${category.slug}`}>
              <div className="bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 cursor-pointer glow-hover">
                <div className="flex items-center mb-4">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 min-w-[3rem] mr-4">
                    {countsLoading ? "..." : (categoryCounts?.[category.id] || 0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{t(`categories.${category.id}`)}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      articles
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
            </SecureLink>
          ))}
        </div>
      </div>
    </Layout>
  );
}