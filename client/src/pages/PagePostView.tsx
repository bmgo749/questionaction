import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  User,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PagePost {
  id: number;
  title?: string;
  content: string;
  type: 'photo' | 'video' | 'discussion';
  mediaUrl?: string;
  mediaType?: string;
  authorId?: string;
  authorName: string;
  authorAlias?: string;
  authorProfileUrl?: string;
  authorIp: string;
  hashtags?: string[];
  isVotingEnabled?: boolean;
  votingTitle?: string;
  votingOptions?: string[];
  likes: number;
  dislikes: number;
  comments: number;
  isNsfw: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PagePostComment {
  id: number;
  postId: number;
  author: string;
  content: string;
  userIp: string;
  authorId?: string;
  authorName?: string;
  authorAlias?: string;
  authorFame?: number;
  authorProfileUrl?: string;
  authorIq?: number;
  authorIsTopaz?: boolean;
  authorIsAgate?: boolean;
  authorIsAqua?: boolean;
  createdAt: string;
}

export default function PagePostView() {
  const [location, setLocation] = useLocation();
  
  // Get the id from query parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const id = urlParams.get('id');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [commentContent, setCommentContent] = useState('');
  const [showNsfwContent, setShowNsfwContent] = useState(false);
  const [hasVerifiedAge, setHasVerifiedAge] = useState(
    localStorage.getItem('nsfw_verified') === 'true'
  );
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voteResults, setVoteResults] = useState<{
    totalVotes: number;
    results: Array<{
      option: string;
      count: number;
      percentage: number;
    }>;
  }>({ totalVotes: 0, results: [] });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleAvatarClick = (authorId?: string) => {
    if (authorId && authorId !== user?.id) {
      setLocation(`/user/${authorId}`);
    }
  };

  // Fetch page post
  const { data: post, isLoading: postLoading } = useQuery<PagePost>({
    queryKey: ['/api/page-posts', id],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch page post');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch like status
  const { data: likeStatus } = useQuery({
    queryKey: ['/api/page-posts', id, 'like-status'],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${id}/like-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch like status');
      }
      return response.json();
    },
    enabled: !!id && !!user,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery<PagePostComment[]>({
    queryKey: ['/api/page-posts', id, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${id}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ isLike }: { isLike: boolean }) => {
      const response = await fetch(`/api/page-posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLike }),
      });
      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts', id, 'like-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts'] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/page-posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      return response.json();
    },
    onSuccess: () => {
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts', id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts'] });
      toast({ title: 'Comment posted successfully' });
    },
  });

  // Fetch vote status and results
  const { data: userVoteStatus } = useQuery({
    queryKey: ['/api/page-posts', id, 'vote-status'],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${id}/vote-status`);
      if (!response.ok) {
        return { success: false, hasVoted: false, selectedOption: null };
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      if (data.success) {
        setHasVoted(data.hasVoted);
        setSelectedOption(data.selectedOption);
      }
    }
  });

  const { data: voteResultsData } = useQuery({
    queryKey: ['/api/page-posts', id, 'votes'],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${id}/votes`);
      if (!response.ok) {
        return { success: false, totalVotes: 0, results: [] };
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 3000, // Refresh vote results every 3 seconds
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      if (data.success) {
        console.log('PagePostView Vote results data:', data);
        setVoteResults(data);
      }
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (option: string) => {
      const response = await fetch(`/api/page-posts/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Update vote results
        setVoteResults(data);
        
        // Check if vote was removed (message contains "removed")
        if (data.message.includes("removed")) {
          setHasVoted(false);
          setSelectedOption(null);
        } else {
          // Vote was added or updated
          setHasVoted(true);
          // Find the selected option from the results
          const selectedResult = data.results.find(r => r.count > 0 && r.percentage > 0);
          if (selectedResult) {
            setSelectedOption(selectedResult.option);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['/api/page-posts', id, 'votes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/page-posts', id, 'vote-status'] });
        toast({ 
          title: data.message || 'Vote submitted successfully',
          description: `Total votes: ${data.totalVotes}`
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Vote failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleAgeVerification = (verified: boolean) => {
    if (verified) {
      localStorage.setItem('nsfw_verified', 'true');
      setHasVerifiedAge(true);
      setShowNsfwContent(true);
    }
  };

  const isNsfwPost = post?.isNsfw;
  const shouldBlurContent = isNsfwPost && (!hasVerifiedAge || !showNsfwContent);

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Page post not found</p>
            <Button onClick={() => setLocation('/page')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/page')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Page
        </Button>
      </div>

      {/* NSFW Age Verification */}
      {isNsfwPost && !hasVerifiedAge && (
        <Card className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              Age Verification Required
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">
              This content contains adult material. You must be 18 years or older to view it.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => handleAgeVerification(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                I am 18+ years old
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/page')}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NSFW Toggle for verified users */}
      {isNsfwPost && hasVerifiedAge && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNsfwContent(!showNsfwContent)}
            className="flex items-center gap-2"
          >
            {showNsfwContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showNsfwContent ? 'Hide NSFW' : 'Show NSFW'}
          </Button>
        </div>
      )}

      {/* Main Post */}
      <Card className={`mb-6 ${isNsfwPost ? 'border-red-300 dark:border-red-700' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar 
                className={`${post.authorId && post.authorId !== user?.id ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all' : ''}`}
                onClick={() => handleAvatarClick(post.authorId)}
              >
                <AvatarImage src={post.authorProfileUrl || ''} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p 
                  className={`font-semibold ${post.authorId && post.authorId !== user?.id ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                  onClick={() => handleAvatarClick(post.authorId)}
                >
                  {post.authorAlias || post.authorName}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={post.type === 'photo' ? 'default' : post.type === 'video' ? 'secondary' : 'outline'}>
                {post.type}
              </Badge>
              {isNsfwPost && (
                <Badge variant="destructive">NSFW</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Title */}
          {post.title && (
            <h1 className={`text-2xl font-bold mb-4 ${shouldBlurContent ? 'blur-md' : ''}`}>
              {post.title}
            </h1>
          )}

          {/* Content */}
          <div className={`mb-4 ${shouldBlurContent ? 'blur-md' : ''}`}>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Media */}
          {post.mediaUrl && (
            <div className={`mb-4 ${shouldBlurContent ? 'blur-md' : ''}`}>
              {post.type === 'photo' ? (
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              ) : post.type === 'video' ? (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full max-h-96 rounded-lg"
                />
              ) : null}
            </div>
          )}

          {/* Voting Section */}
          {post.isVotingEnabled && post.votingOptions && post.votingOptions.length > 0 && (
            <div className={`mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${shouldBlurContent ? 'blur-md' : ''}`}>
              <h4 className="font-semibold mb-3">
                {post.votingTitle || 'Vote on this post:'}
              </h4>
              <div className="space-y-3">
                {post.votingOptions.map((option, index) => {
                  const result = voteResults.results.find(r => r.option === option);
                  const isSelected = selectedOption === option;
                  const percentage = result?.percentage || 0;
                  const count = result?.count || 0;
                  
                  return (
                    <div key={index} className="relative">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full justify-start text-left relative overflow-hidden ${
                          isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => voteMutation.mutate(option)}
                        disabled={voteMutation.isPending}
                      >
                        {/* Progress bar background */}
                        <div 
                          className="absolute inset-0 bg-blue-200 dark:bg-blue-900 opacity-30 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                        
                        {/* Option text */}
                        <span className="relative z-10 flex-1">{option}</span>
                        
                        {/* Vote count and percentage */}
                        <div className="relative z-10 ml-auto flex items-center space-x-3">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="text-sm font-medium bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {count} vote{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              {/* Voting status and total count */}
              <div className="mt-4 flex items-center justify-between text-sm border-t pt-3 border-gray-200 dark:border-gray-700">
                <div>
                  {hasVoted ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      You voted for "{selectedOption}"
                    </span>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">Click an option to vote</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 dark:text-gray-400">Total votes:</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                    {voteResults.totalVotes}
                  </span>
                </div>
              </div>
              
              {hasVoted && (
                <p className="text-xs text-gray-500 mt-2">
                  You can change your vote by clicking a different option
                </p>
              )}
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.hashtags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            {user && !isNsfwPost ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate({ isLike: true })}
                  disabled={likeMutation.isPending}
                  className={`flex items-center gap-2 ${
                    likeStatus?.isLiked ? 'text-blue-600 bg-blue-50' : ''
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {post.likes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate({ isLike: false })}
                  disabled={likeMutation.isPending}
                  className={`flex items-center gap-2 ${
                    likeStatus?.isDisliked ? 'text-red-600 bg-red-50' : ''
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {post.dislikes}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <ThumbsUp className="w-4 h-4" />
                  {isNsfwPost ? (
                    <span className="line-through">Disabled</span>
                  ) : (
                    post.likes
                  )}
                </div>
                {isNsfwPost && (
                  <Badge variant="destructive" className="text-xs">
                    NSFW Content
                  </Badge>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {post.comments}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        </CardHeader>
        <CardContent>
          {/* Add Comment */}
          <div className="mb-6">
            <Textarea
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="mb-3"
            />
            <Button
              onClick={() => commentMutation.mutate(commentContent)}
              disabled={!commentContent.trim() || commentMutation.isPending}
            >
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-start gap-3">
                  <Avatar 
                    className={`w-8 h-8 ${comment.authorId && comment.authorId !== user?.id ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all' : ''}`}
                    onClick={() => handleAvatarClick(comment.authorId)}
                  >
                    <AvatarImage src={comment.authorProfileUrl || ''} />
                    <AvatarFallback>
                      <User className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className={`font-medium text-sm ${comment.authorId && comment.authorId !== user?.id ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                        onClick={() => handleAvatarClick(comment.authorId)}
                      >
                        {comment.authorAlias || comment.authorName || comment.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}