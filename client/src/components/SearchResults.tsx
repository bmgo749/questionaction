import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Article } from '@shared/schema';

interface SearchResultsProps {
  searchTerm: string;
  onBack: () => void;
}

export function SearchResults({ searchTerm, onBack }: SearchResultsProps) {
  const { t } = useLanguage();
  const [isSearching, setIsSearching] = useState(true);

  // Search articles using API
  const { data: searchResults = [], isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles/search', searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search articles');
      }
      return response.json();
    },
    enabled: !!searchTerm,
  });

  // Simulate search loading
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (isSearching || isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-black rounded-lg p-8 mb-8 text-gray-900 dark:text-white border border-black dark:border-gray-800">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
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
    <div className="space-y-6">
      {/* Search Results Header */}
      <Card className="glow-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('search.backToHome')}
              </Button>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('search.resultsFor')}:
                </span>
                <span className="font-semibold">"{searchTerm}"</span>
              </div>
            </div>
            <Badge variant="secondary">
              {searchResults.length} {t('search.articlesFound')}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Search Results */}
      {searchResults.length === 0 ? (
        <Card className="glow-hover">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('search.noResults')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {t('search.noResultsDesc')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((article) => (
            <Link key={article.id} href={`/article/${article.id}`}>
              <Card className="glow-hover cursor-pointer hover:shadow-lg transition-shadow h-full">
                {article.thumbnail && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {article.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {t(`categories.${cat}`)}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
                    {article.content.length > 150 ? `${article.content.substring(0, 150)}...` : article.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>👍 {article.likes}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}