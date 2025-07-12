import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SecureLink } from '@/components/SecureRouter';
import { ArrowLeft, Search, FileText, AlertTriangle, Heart, MessageCircle, Camera, Video, CheckCircle2, ChevronLeft, ChevronRight, Shield, Users, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Article, PagePost } from '@shared/schema';

interface SearchResultsProps {
  searchTerm: string;
  onBack: () => void;
}

export function SearchResults({ searchTerm, onBack }: SearchResultsProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(true);
  const [searchMode, setSearchMode] = useState<'all' | 'guilds' | 'pagefeed'>('all');
  
  // NSFW consent management
  const [nsfwConsent, setNsfwConsent] = useState(() => {
    return localStorage.getItem('nsfwConsent') === 'true';
  });
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [currentNsfwPost, setCurrentNsfwPost] = useState<PagePost | null>(null);
  const [showNsfwContent, setShowNsfwContent] = useState(false);
  const [nsfwPage, setNsfwPage] = useState(0);
  const [nsfwHistory, setNsfwHistory] = useState<PagePost[][]>([]);
  const NSFW_POSTS_PER_PAGE = 10;

  // Search articles using API with security and caching
  const { data: articleResults = [], isLoading: isLoadingArticles } = useQuery<Article[]>({
    queryKey: ['/api/articles/search', searchTerm],
    queryFn: async () => {
      // Sanitize search term
      const sanitizedTerm = searchTerm.replace(/[<>'"]/g, '').trim();
      if (sanitizedTerm.length < 2) {
        throw new Error('Search term must be at least 2 characters');
      }
      
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(sanitizedTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search articles');
      }
      return response.json();
    },
    enabled: !!searchTerm && searchTerm.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Search page posts using API with NSFW filtering
  const { data: pageResults = [], isLoading: isLoadingPages } = useQuery<PagePost[]>({
    queryKey: ['/api/page-posts/search', searchTerm, nsfwConsent],
    queryFn: async () => {
      const sanitizedTerm = searchTerm.replace(/[<>'"]/g, '').trim();
      if (sanitizedTerm.length < 2) {
        throw new Error('Search term must be at least 2 characters');
      }
      
      const response = await fetch(`/api/page-posts/search?q=${encodeURIComponent(sanitizedTerm)}&includeNsfw=${nsfwConsent}`);
      if (!response.ok) {
        throw new Error('Failed to search page posts');
      }
      return response.json();
    },
    enabled: !!searchTerm && searchTerm.trim().length >= 2 && (searchMode === 'all' || searchMode === 'pagefeed'),
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    cacheTime: 7 * 60 * 1000, // Keep in cache for 7 minutes
  });

  // Search guilds using API
  const { data: guildResults = [], isLoading: isLoadingGuilds } = useQuery({
    queryKey: ['/api/guilds/search', searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/guilds/search/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to search guilds');
      }
      return response.json();
    },
    enabled: !!searchTerm && (searchMode === 'all' || searchMode === 'guilds'),
  });

  // Simulate search loading
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAgeVerification = (isAdult: boolean) => {
    if (isAdult) {
      setNsfwConsent(true);
      localStorage.setItem('nsfwConsent', 'true');
      toast({
        title: "Verifikasi usia berhasil",
        description: "Konten NSFW sekarang akan ditampilkan.",
      });
    }
    setShowAgeVerification(false);
    setCurrentNsfwPost(null);
  };

  const toggleNsfwFilter = () => {
    const newShowNsfw = !showNsfwContent;
    setShowNsfwContent(newShowNsfw);
    setNsfwPage(0);
    setNsfwHistory([]);
    
    if (newShowNsfw) {
      // When enabling NSFW mode, store first page
      const nsfwPosts = pageResults.filter(post => post.isNsfw);
      const firstPagePosts = nsfwPosts.slice(0, NSFW_POSTS_PER_PAGE);
      setNsfwHistory([firstPagePosts]);
    }
  };

  const showMoreNsfw = () => {
    const nsfwPosts = pageResults.filter(post => post.isNsfw);
    const startIndex = (nsfwPage + 1) * NSFW_POSTS_PER_PAGE;
    const nextPagePosts = nsfwPosts.slice(startIndex, startIndex + NSFW_POSTS_PER_PAGE);
    
    if (nextPagePosts.length > 0) {
      setNsfwPage(nsfwPage + 1);
      // Limit history to prevent memory leak - keep only last 5 pages
      const newHistory = [...nsfwHistory, nextPagePosts];
      if (newHistory.length > 5) {
        newHistory.shift(); // Remove oldest page
        setNsfwPage(nsfwPage); // Adjust page index
      }
      setNsfwHistory(newHistory);
    }
  };

  const showPreviousNsfw = () => {
    if (nsfwPage > 0) {
      setNsfwPage(nsfwPage - 1);
      const newHistory = nsfwHistory.slice(0, -1);
      setNsfwHistory(newHistory);
    }
  };

  const handleSearchGuilds = (query: string) => {
    setSearchMode('guilds');
    toast({
      title: "Guild Search Mode",
      description: `Searching guilds with insignia or keywords matching "${query}"`,
    });
  };

  const handleSearchPagefeed = (query: string) => {
    setSearchMode('pagefeed');
    toast({
      title: "Pagefeed Search Mode", 
      description: `Searching page posts with keywords similar to "${query}"`,
    });
  };

  const isLoading = isLoadingArticles || isLoadingPages || isLoadingGuilds;
  
  // Filter page posts based on NSFW preference and pagination
  let filteredPageResults: PagePost[];
  if (showNsfwContent) {
    // Show only current page of NSFW posts
    filteredPageResults = nsfwHistory[nsfwPage] || [];
  } else {
    // Show non-NSFW posts
    filteredPageResults = pageResults.filter(post => !post.isNsfw);
  }
  
  // Calculate total results based on search mode
  let totalResults;
  if (searchMode === 'guilds') {
    totalResults = guildResults.length;
  } else if (searchMode === 'pagefeed') {
    totalResults = filteredPageResults.length;
  } else {
    totalResults = articleResults.length + filteredPageResults.length + guildResults.length;
  }
  
  // Check if there are more NSFW posts available
  const nsfwPosts = pageResults.filter(post => post.isNsfw);
  const hasMoreNsfw = showNsfwContent && (nsfwPage + 1) * NSFW_POSTS_PER_PAGE < nsfwPosts.length;
  const hasPreviousNsfw = showNsfwContent && nsfwPage > 0;

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
            <div className="flex items-center gap-2">
              {searchMode !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchMode('all')}
                >
                  All Results
                </Button>
              )}
              
              <Button
                variant={searchMode === 'guilds' ? 'default' : 'outline'}
                size="sm"
                className={searchMode === 'guilds' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'}
                onClick={() => handleSearchGuilds(searchTerm)}
              >
                Guild
              </Button>
              
              <Button
                variant={searchMode === 'pagefeed' ? 'default' : 'outline'}
                size="sm"
                className={searchMode === 'pagefeed' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'}
                onClick={() => handleSearchPagefeed(searchTerm)}
              >
                Pagefeed
              </Button>
              
              <Button
                variant={showNsfwContent ? "destructive" : "outline"}
                size="sm"
                onClick={toggleNsfwFilter}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {showNsfwContent ? "Hide NSFW" : "Show NSFW"}
              </Button>
              
              {/* NSFW Navigation Controls */}
              {showNsfwContent && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showPreviousNsfw}
                    disabled={!hasPreviousNsfw}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-gray-500 px-2">
                    Halaman {nsfwPage + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showMoreNsfw}
                    disabled={!hasMoreNsfw}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <Badge variant="secondary">
                {totalResults} hasil
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search Results */}
      {totalResults === 0 ? (
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
        <div className="space-y-6">
          {/* Guild Results Section */}
          {guildResults.length > 0 && (searchMode === 'all' || searchMode === 'guilds') && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Guilds ({guildResults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guildResults.map((guild: any) => (
                  <SecureLink key={guild.id} href={`/guild/${guild.id}`}>
                    <Card className="glow-hover cursor-pointer hover:shadow-lg transition-shadow h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                              style={{ backgroundColor: guild.logoBackgroundColor }}
                            >
                              {guild.logo === 'logo1' && '🛡️'}
                              {guild.logo === 'logo2' && '👑'}
                              {guild.logo === 'logo3' && '⭐'}
                              {guild.logo === 'logo4' && '⚔️'}
                              {guild.logo === 'logo5' && '🐲'}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{guild.name}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {guild.insignia}
                                </Badge>
                                {guild.isPrivate ? (
                                  <Lock className="w-3 h-3 text-red-500" />
                                ) : (
                                  <Globe className="w-3 h-3 text-green-500" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {guild.memberCount}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {guild.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            Created by {guild.ownerName}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {guild.postCount} posts
                            </Badge>
                            <Badge 
                              variant={guild.isPrivate ? "destructive" : "secondary"} 
                              className="text-xs"
                            >
                              {guild.isPrivate ? "Private" : "Public"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SecureLink>
                ))}
              </div>
            </div>
          )}

          {/* Articles Section */}
          {articleResults.length > 0 && searchMode === 'all' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Artikel ({articleResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articleResults.map((article) => (
                  <SecureLink key={article.id} href={`/article/${article.id}`}>
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
                  </SecureLink>
                ))}
              </div>
            </div>
          )}

          {/* Page Posts Section */}
          {filteredPageResults.length > 0 && (searchMode === 'all' || searchMode === 'pagefeed') && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Page Posts ({filteredPageResults.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPageResults.map((post) => (
                  <Card key={post.id} className="glow-hover h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {post.type === 'photo' && <Camera className="w-4 h-4 text-green-600" />}
                            {post.type === 'video' && <Video className="w-4 h-4 text-red-600" />}
                            {post.type === 'discussion' && <FileText className="w-4 h-4 text-blue-600" />}
                            <span className="text-xs font-medium capitalize">{post.type}</span>
                          </div>
                          {post.isNsfw && (
                            <Badge variant="destructive" className="text-xs">
                              NSFW
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Title with NSFW blur */}
                      {post.title && (
                        <div className={`${post.isNsfw && !nsfwConsent ? 'blur-sm' : ''} relative mt-2`}>
                          {post.isNsfw && !nsfwConsent && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer rounded"
                              onClick={() => {
                                setCurrentNsfwPost(post);
                                setShowAgeVerification(true);
                              }}>
                              <Badge variant="destructive" className="text-xs">Klik untuk lihat</Badge>
                            </div>
                          )}
                          <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      {/* Content with NSFW blur */}
                      <div className={`${post.isNsfw && !nsfwConsent ? 'blur-sm' : ''} relative`}>
                        {post.isNsfw && !nsfwConsent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer rounded"
                            onClick={() => {
                              setCurrentNsfwPost(post);
                              setShowAgeVerification(true);
                            }}>
                            <Badge variant="destructive" className="text-xs">Klik untuk lihat</Badge>
                          </div>
                        )}
                        <p className="text-sm line-clamp-3">
                          {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                        </p>
                      </div>
                      
                      {/* Media with NSFW blur */}
                      {post.mediaUrl && (
                        <div className={`rounded-lg overflow-hidden relative ${post.isNsfw && !nsfwConsent ? 'blur-md' : ''}`}>
                          {post.isNsfw && !nsfwConsent && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
                              onClick={() => {
                                setCurrentNsfwPost(post);
                                setShowAgeVerification(true);
                              }}>
                              <AlertTriangle className="w-6 h-6 text-red-400 mb-1" />
                              <Badge variant="destructive" className="text-xs">NSFW</Badge>
                            </div>
                          )}
                          {post.mediaType === 'image' ? (
                            <img 
                              src={post.mediaUrl} 
                              alt="Post media" 
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <video 
                              src={post.mediaUrl} 
                              className="w-full h-32 object-cover"
                              controls={post.isNsfw ? nsfwConsent : true}
                            />
                          )}
                        </div>
                      )}
                      
                      {/* Stats and Actions */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          {!post.isNsfw && (
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.comments}
                          </span>
                          {post.isNsfw && (
                            <Badge variant="outline" className="text-xs">
                              Konten Dewasa
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          {!post.isNsfw && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-6 px-2"
                              onClick={() => window.location.href = `/page-post/${post.id}`}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Age Verification Dialog */}
      <Dialog open={showAgeVerification} onOpenChange={setShowAgeVerification}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Verifikasi Usia
            </DialogTitle>
            <DialogDescription>
              Konten ini ditandai sebagai NSFW (Not Safe For Work). Anda harus berusia 18 tahun atau lebih untuk melihat konten ini.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => handleAgeVerification(true)}
              variant="destructive"
              className="w-full"
            >
              Ya, saya berusia 18+ tahun
            </Button>
            <Button
              onClick={() => handleAgeVerification(false)}
              variant="outline"
              className="w-full"
            >
              Tidak, saya belum berusia 18 tahun
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}