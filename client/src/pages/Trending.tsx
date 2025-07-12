import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Eye, ThumbsUp, MessageCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Article } from '@shared/schema';
import { useState } from 'react';

export default function Trending() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;

  const { data: allTrendingArticles = [], isLoading } = useQuery({
    queryKey: ['/api/articles/trending'],
    queryFn: async () => {
      const response = await fetch('/api/articles/trending');
      if (!response.ok) {
        throw new Error('Failed to fetch trending articles');
      }
      return response.json();
    },
  });

  // Paginate the trending articles (max 20 articles total)
  const maxArticles = Math.min(allTrendingArticles.length, 20);
  const totalPages = Math.ceil(maxArticles / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const trendingArticles = allTrendingArticles.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Trending Now
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Loading trending topics...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-black rounded-lg border border-black dark:border-gray-800 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trending Now
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Discover the most popular and discussed topics right now
          </p>
        </div>

        {trendingArticles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Trending Articles Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Start creating and engaging with content to see trending topics appear here
              </p>
              <SecureLink href="/create-article">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Create Article
                </button>
              </SecureLink>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingArticles.map((article: Article, index: number) => (
              <SecureLink key={article.id} href={`/article/${article.id}`}>
                <Card className="cursor-pointer glow-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        #{startIndex + index + 1} Trending
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {article.categories?.[0] || 'General'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {article.thumbnail && (
                      <img 
                        src={article.thumbnail} 
                        alt={article.title}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.content?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>0</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SecureLink>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({maxArticles} articles)
              </span>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}