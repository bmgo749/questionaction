import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown, Star, MessageCircle, Send, Calendar, User, X, Maximize, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import type { Article, Comment } from '@shared/schema';

interface LikeStatus {
  isLiked: boolean;
  isDisliked: boolean;
  isFavorited: boolean;
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Fetch article
  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: ['/api/articles', id],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['/api/articles', id, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${id}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch like status
  const { data: likeStatus } = useQuery<LikeStatus>({
    queryKey: ['/api/articles', id, 'like-status'],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${id}/like-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch like status');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Like/Dislike mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: async (isLike: boolean) => {
      const response = await fetch(`/api/articles/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isLike }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like');
      }
      
      return response.json();
    },
    onMutate: async (isLike: boolean) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/articles', id] });
      await queryClient.cancelQueries({ queryKey: ['/api/articles', id, 'like-status'] });

      // Snapshot the previous values
      const previousArticle = queryClient.getQueryData(['/api/articles', id]);
      const previousLikeStatus = queryClient.getQueryData(['/api/articles', id, 'like-status']) as LikeStatus | undefined;

      // Optimistically update the like status
      queryClient.setQueryData(['/api/articles', id, 'like-status'], (old: LikeStatus | undefined) => {
        if (!old) return { isLiked: false, isDisliked: false, isFavorited: false };
        
        if (isLike) {
          // If already liked, remove the like
          if (old.isLiked) {
            return { ...old, isLiked: false, isDisliked: false };
          }
          // If not liked or was disliked, set to liked
          return { ...old, isLiked: true, isDisliked: false };
        } else {
          // If already disliked, remove the dislike
          if (old.isDisliked) {
            return { ...old, isLiked: false, isDisliked: false };
          }
          // If not disliked or was liked, set to disliked
          return { ...old, isLiked: false, isDisliked: true };
        }
      });

      // Optimistically update the article like count
      queryClient.setQueryData(['/api/articles', id], (old: Article | undefined) => {
        if (!old || !previousLikeStatus) return old;
        
        let newLikes = old.likes;
        
        if (isLike) {
          // If user is clicking like
          if (previousLikeStatus.isLiked) {
            // If already liked, remove the like (count -1)
            newLikes = old.likes - 1;
          } else {
            // If not liked or was disliked, add the like (count +1)
            newLikes = old.likes + 1;
          }
        } else {
          // If user is clicking dislike
          if (previousLikeStatus.isLiked) {
            // If was liked, remove the like (count -1)
            newLikes = old.likes - 1;
          }
          // If already disliked or not liked, count stays the same
        }
        
        return { ...old, likes: Math.max(0, newLikes) };
      });

      return { previousArticle, previousLikeStatus };
    },
    onError: (err, isLike, context) => {
      // Revert the optimistic updates on error
      if (context?.previousArticle) {
        queryClient.setQueryData(['/api/articles', id], context.previousArticle);
      }
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(['/api/articles', id, 'like-status'], context.previousLikeStatus);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/articles', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/articles', id, 'like-status'] });
    },
  });

  // Favorite mutation with optimistic updates
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/articles/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }
      
      return response.json();
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/articles', id, 'like-status'] });

      // Snapshot the previous value
      const previousLikeStatus = queryClient.getQueryData(['/api/articles', id, 'like-status']);

      // Optimistically update the favorite status
      queryClient.setQueryData(['/api/articles', id, 'like-status'], (old: LikeStatus | undefined) => {
        if (!old) return old;
        return { ...old, isFavorited: !old.isFavorited };
      });

      return { previousLikeStatus };
    },
    onError: (err, variables, context) => {
      // Revert the optimistic update on error
      if (context?.previousLikeStatus) {
        queryClient.setQueryData(['/api/articles', id, 'like-status'], context.previousLikeStatus);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/articles', id, 'like-status'] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (commentData: { content: string }) => {
      const response = await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/articles', id, 'comments'] });
      toast({
        title: 'Comment Posted',
        description: 'Your comment has been added successfully!',
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate(true);
  };

  const handleDislike = () => {
    likeMutation.mutate(false);
  };

  const handleFavorite = () => {
    favoriteMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment.',
        variant: 'destructive',
      });
      return;
    }
    
    commentMutation.mutate({
      content: commentContent.trim(),
    });
  };

  if (articleLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <Card className="glow-hover">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400">
                The article you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Article Header */}
        <Card className="glow-hover">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {article.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {t(`categories.${category}`)}
                  </Badge>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
              >
                <X className="h-4 w-4 mr-2" />
                Exit Article
              </Button>
            </div>
            <CardTitle className="text-3xl font-bold mb-4">{article.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.createdAt).toLocaleDateString()}
              </div>
              <span>•</span>
              <span>Language: {article.language.toUpperCase()}</span>
            </div>
          </CardHeader>
        </Card>

        {/* Article Thumbnail */}
        {article.thumbnail && (
          <Card className="glow-hover">
            <CardContent className="p-0 relative group">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg cursor-pointer"
                onClick={() => setIsImageFullscreen(true)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => setIsImageFullscreen(true)}
                >
                  <Maximize className="h-4 w-4 mr-2" />
                  View Fullscreen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fullscreen Image Modal */}
        {isImageFullscreen && article.thumbnail && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto"
            onClick={() => setIsImageFullscreen(false)}
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="relative">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="max-w-full h-auto object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => setIsImageFullscreen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <Card className="glow-hover">
          <CardContent className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-lg leading-relaxed">
                {article.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Actions */}
        <Card className="glow-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={likeStatus?.isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {article.likes}
                </Button>
                
                <Button
                  variant={likeStatus?.isDisliked ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleDislike}
                  disabled={likeMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  Dislike
                </Button>

                <Button
                  variant={likeStatus?.isFavorited ? "default" : "outline"}
                  size="sm"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Star className={`h-4 w-4 ${likeStatus?.isFavorited ? 'fill-current' : ''}`} />
                  Favorite
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MessageCircle className="h-4 w-4" />
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="glow-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleComment} className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.profileImageUrl || '/default-avatar.png'} 
                      alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    />
                    <AvatarFallback className="bg-orange-500 text-white text-xs">
                      {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                      {user?.aliasName && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          @{user.aliasName}
                        </Badge>
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        {user?.fame || 0} Fame
                      </span>
                    </div>
                  </div>
                </div>
                <Textarea
                  placeholder="Write your comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <Button 
                  type="submit" 
                  disabled={commentMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You need to be logged in to post comments
                </p>
                <Button asChild>
                  <a href="/auth">Login to Comment</a>
                </Button>
              </div>
            )}

            <Separator />

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage 
                        src={comment.authorProfileUrl || '/default-avatar.png'} 
                        alt={comment.authorName || comment.author}
                      />
                      <AvatarFallback className="bg-orange-500 text-white text-sm">
                        {getInitials(
                          comment.authorName?.split(' ')[0], 
                          comment.authorName?.split(' ')[1]
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.authorName || comment.author}
                        </span>
                        {comment.authorAlias && (
                          <Badge variant="secondary" className="text-xs">
                            @{comment.authorAlias}
                          </Badge>
                        )}
                        {comment.authorFame !== undefined && comment.authorFame !== null && comment.authorFame > 0 && (
                          <div className="flex items-center gap-1">
                            <Crown className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              {comment.authorFame} Fame
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}