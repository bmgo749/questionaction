import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Sidebar } from '@/components/Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryBySlug } from '@/data/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Article } from '@shared/schema';
import { X } from 'lucide-react';
import { useCategoryCounts } from '@/hooks/useCategoryCounts';
import { SecureLink } from '@/components/SecureRouter';

interface CategoryProps {
  slug: string;
}

export default function Category({ slug }: CategoryProps) {
  const { t } = useLanguage();
  const { data: categoryCounts, isLoading: countsLoading } = useCategoryCounts();
  
  const category = getCategoryBySlug(slug);
  
  // Fetch articles by category
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles/category', slug],
    queryFn: () => fetch(`/api/articles/category/${slug}`).then(res => res.json()),
    enabled: !!slug,
  });

  if (!category) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category not found</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              The category you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:space-x-8">
          <Sidebar />
          
          <div className="lg:flex-1">
            {/* Category Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 min-w-[4rem] mr-6">
                    {countsLoading ? "..." : (categoryCounts?.[category.id] || 0)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {t(`categories.${category.id}`)}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {articles.length} article{articles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <SecureLink href="/">
                  <Button variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Exit Category
                  </Button>
                </SecureLink>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {t(`categoryDescriptions.${category.id}`)}
              </p>
            </div>

            {/* Content Area */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Loading articles...
                  </h3>
                </div>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    No articles yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    This category is waiting for content. Be the first to contribute articles about {t(`categories.${category.id}`).toLowerCase()}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <SecureLink key={article.id} href={`/article/${article.id}`}>
                    <Card className="glow-hover cursor-pointer hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                              {article.title}
                            </CardTitle>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {article.categories.map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {t(`categories.${cat}`)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
                          {article.content.length > 100 ? `${article.content.substring(0, 100)}...` : article.content}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{article.language.toUpperCase()}</span>
                          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </SecureLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
