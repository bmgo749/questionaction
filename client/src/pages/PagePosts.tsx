import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, MessageCircle, ThumbsDown, ThumbsUp, Camera, Video, FileText, CheckCircle2, Trash2, AlertTriangle, Home, Plus, ExternalLink, Eye, EyeOff, ChevronLeft, ChevronRight, Hash, ArrowLeft, User } from "lucide-react";
import { format } from "date-fns";
import { SecureLink } from "@/components/SecureRouter";
import { generateSecureLink } from "@/lib/security";
import { useLanguage } from "@/contexts/LanguageContext";
import { HashtagInput } from "@/components/HashtagInput";
import { useAuth } from "@/hooks/useAuth";
import type { PagePost, PagePostComment } from "@shared/schema";

// Import the individual post view component
import PagePostView from './PagePostView';

// VotingSection component for displaying voting with percentages
function VotingSection({ post, showNSFW }: { post: PagePost, showNSFW: boolean }) {
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vote status and results
  const { data: userVoteStatus } = useQuery({
    queryKey: ['/api/page-posts', post.id, 'vote-status'],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${post.id}/vote-status`);
      if (!response.ok) {
        return { success: false, hasVoted: false, selectedOption: null };
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    enabled: post.isVotingEnabled && post.votingOptions && post.votingOptions.length > 0,
  });

  // Sync user vote status with component state
  React.useEffect(() => {
    if (userVoteStatus?.success) {
      setHasVoted(userVoteStatus.hasVoted);
      setSelectedOption(userVoteStatus.selectedOption);
    }
  }, [userVoteStatus]);

  const { data: voteResultsData } = useQuery({
    queryKey: ['/api/page-posts', post.id, 'votes'],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${post.id}/votes`);
      if (!response.ok) {
        return { success: false, totalVotes: 0, results: [] };
      }
      return response.json();
    },
    enabled: post.isVotingEnabled && post.votingOptions && post.votingOptions.length > 0,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes  
    refetchInterval: 3000, // Refresh vote results every 3 seconds
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Sync vote results with component state - PRIORITY: API data overrides defaults
  React.useEffect(() => {
    if (voteResultsData?.success) {
      console.log('Vote results data:', voteResultsData);
      setVoteResults(voteResultsData);
    } else if (post.votingOptions && post.votingOptions.length > 0) {
      // Only set defaults if no API data exists
      const initialResults = post.votingOptions.map(option => ({
        option,
        count: 0,
        percentage: 0
      }));
      setVoteResults({
        totalVotes: 0,
        results: initialResults
      });
    }
  }, [voteResultsData, post.votingOptions]);

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (option: string) => {
      const response = await fetch(`/api/page-posts/${post.id}/vote`, {
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
          // Vote was added or updated - find the option user voted for
          setHasVoted(true);
          // Find the option from the response data
          const votedOption = data.results.find(r => r.count > 0)?.option;
          if (votedOption) {
            setSelectedOption(votedOption);
          }
        }
        
        // Force refresh of vote data for persistence
        queryClient.invalidateQueries({ queryKey: ['/api/page-posts', post.id, 'votes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/page-posts', post.id, 'vote-status'] });
        queryClient.refetchQueries({ queryKey: ['/api/page-posts', post.id, 'vote-status'] });
        
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

  return (
    <div className={`mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${post.isNsfw && !showNSFW ? 'blur-md' : ''}`}>
      <h4 className="font-semibold mb-3">
        {(post as any).votingTitle || 'Vote on this post:'}
      </h4>
      <div className="space-y-3">
        {post.votingOptions?.map((option, index) => {
          const result = voteResults.results.find(r => r.option === option);
          const isSelected = selectedOption === option;
          const percentage = result?.percentage || 0;
          const count = result?.count || 0;
          
          // Debug logging
          console.log(`Option ${option}: result=`, result, `percentage=${percentage}, count=${count}`);
          console.log('Full voteResults state:', voteResults);
          
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
  );
}

export default function PagePosts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [location] = useLocation();
  
  // Check if we have an id parameter for individual post view
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const postId = urlParams.get('id');
  
  // If we have a post ID, show the individual post view
  if (postId) {
    return <PagePostView />;
  }
  
  // NSFW management
  const [showNSFW, setShowNSFW] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showResponsibilityDialog, setShowResponsibilityDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10;

  // Double verification handlers
  const handleNSFWToggle = () => {
    if (!showNSFW) {
      setShowAgeVerification(true);
    } else {
      setShowNSFW(false);
      setCurrentPage(1);
    }
  };

  const handleAgeVerification = (isAdult: boolean) => {
    setShowAgeVerification(false);
    if (isAdult) {
      setShowResponsibilityDialog(true);
    }
  };

  const handleResponsibilityConfirmation = (accepted: boolean) => {
    setShowResponsibilityDialog(false);
    if (accepted) {
      setShowNSFW(true);
      setCurrentPage(1);
      toast({
        title: "NSFW Content Enabled",
        description: "Adult content is now visible. Content includes both regular and NSFW posts.",
      });
    }
  };

  // Fetch page posts with NSFW filtering
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/page-posts', showNSFW],
    queryFn: async () => {
      const url = showNSFW ? '/api/page-posts?includeNsfw=true' : '/api/page-posts';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const allPosts = await response.json() as PagePost[];
      return allPosts;
    },
  });

  // Pagination logic
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Like/dislike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLike }: { postId: number; isLike: boolean }) => {
      const response = await fetch(`/api/page-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isLike }),
      });
      if (!response.ok) throw new Error('Failed to update like status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating like status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/page-posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts'] });
      toast({
        title: "Post deleted!",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading page posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Page</h1>
          <p className="text-gray-600 dark:text-gray-400">Social media for the Queit community</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleNSFWToggle}
            variant={showNSFW ? "destructive" : "outline"}
            className="flex items-center gap-2"
          >
            {showNSFW ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showNSFW ? "Hide NSFW" : "Show NSFW"}
          </Button>
          <SecureLink href="/page-create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Post
            </Button>
          </SecureLink>
          <SecureLink href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </SecureLink>
        </div>
      </div>

      {/* Pagination Info */}
      {showNSFW && totalPosts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">NSFW Content Active</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Showing all posts (including adult content). Total: {totalPosts} posts, Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {paginatedPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {showNSFW ? "No posts available on this page!" : "No posts available on Page!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedPosts.map((post) => (
            <PagePostCard 
              key={post.id} 
              post={post} 
              user={user}
              onLike={(isLike) => likeMutation.mutate({ postId: post.id, isLike })}
              onDelete={() => deleteMutation.mutate(post.id)}
              showNSFW={showNSFW}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-xs text-gray-500">
              ({totalPosts} total posts)
            </span>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Age Verification Modal */}
      <Dialog open={showAgeVerification} onOpenChange={setShowAgeVerification}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Age Verification Required
            </DialogTitle>
            <DialogDescription>
              This content is marked as NSFW (Not Safe For Work) and requires age verification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This content may contain mature themes, explicit material, or other content not suitable for minors.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium mb-4">Are you 18 years or older?</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => handleAgeVerification(false)}
                  className="w-20"
                >
                  No
                </Button>
                <Button 
                  onClick={() => handleAgeVerification(true)}
                  className="w-20"
                >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Responsibility Confirmation Dialog */}
      <Dialog open={showResponsibilityDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Responsibility Acknowledgment
            </DialogTitle>
            <DialogDescription>
              Please confirm your understanding of the content policy.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Important:</strong> By enabling NSFW content, you acknowledge that:
              </p>
              <ul className="text-xs text-orange-700 mt-2 space-y-1 list-disc list-inside">
                <li>You are accessing content intended for mature audiences</li>
                <li>You take full responsibility for viewing this content</li>
                <li>You understand this may include explicit material</li>
                <li>You will not share or distribute inappropriate content</li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium mb-4">
                Do you understand and accept these responsibilities?
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => handleResponsibilityConfirmation(false)}
                  className="w-24"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleResponsibilityConfirmation(true)}
                  className="w-24 bg-red-600 hover:bg-red-700"
                >
                  I Accept
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PagePostCardProps {
  post: PagePost;
  user: any;
  onLike: (isLike: boolean) => void;
  onDelete: () => void;
  showNSFW: boolean;
}

function PagePostCard({ post, user, onLike, onDelete, showNSFW }: PagePostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleAvatarClick = (authorId?: string) => {
    if (authorId && authorId !== user?.id) {
      // Use secure navigation
      window.location.href = generateSecureLink(`/user/${authorId}`, user?.id);
    }
  };

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: [`/api/page-posts/${post.id}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/page-posts/${post.id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json() as PagePostComment[];
    },
    enabled: showComments,
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/page-posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/page-posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts'] }); // Update post list to refresh comment count
      setNewComment('');
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  const isRegisteredUser = !!user;

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar 
            className={`${post.authorId && post.authorId !== user?.id ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all' : ''}`}
            onClick={() => handleAvatarClick(post.authorId)}
          >
            <AvatarImage src={post.authorProfileUrl || ''} />
            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 
                className={`font-semibold ${post.authorId && post.authorId !== user?.id ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                onClick={() => handleAvatarClick(post.authorId)}
              >
                {post.authorAlias || post.authorName}
              </h3>
              {post.authorId && user && user.fame >= 500 && (
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <PostTypeIcon type={post.type} />
                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
              </Badge>
              {post.isNsfw && (
                <Badge variant="destructive">NSFW</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
          {/* Show delete button only for post author */}
          {((post.authorId && user?.id === post.authorId) || (!post.authorId && !user)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        {post.title && (
          <div className={`${post.isNsfw && !showNSFW ? 'blur-sm' : ''} relative`}>
            {post.isNsfw && !showNSFW && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                <Badge variant="destructive" className="text-xs">NSFW Content</Badge>
              </div>
            )}
            <CardTitle>{post.title}</CardTitle>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">

        {/* Content with NSFW blur */}
        <div className={`${post.isNsfw && !showNSFW ? 'blur-sm' : ''} relative`}>
          {post.isNsfw && !showNSFW && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
              <Badge variant="destructive" className="text-xs">NSFW Content</Badge>
            </div>
          )}
          <p>{post.content}</p>
        </div>
        
        {/* Media with NSFW blur */}
        {post.mediaUrl && (
          <div className={`rounded-lg overflow-hidden relative ${post.isNsfw && !showNSFW ? 'blur-md' : ''}`}>
            {post.isNsfw && !showNSFW && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40">
                <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                <Badge variant="destructive" className="mb-2">NSFW Content</Badge>
                <p className="text-white text-sm text-center px-4">
                  Click to verify age and view
                </p>
              </div>
            )}
            {post.mediaType === 'image' ? (
              <img 
                src={post.mediaUrl} 
                alt="Post media" 
                className="w-full max-h-96 object-cover"
              />
            ) : (
              <video 
                src={post.mediaUrl} 
                controls 
                className="w-full max-h-96"
              />
            )}
          </div>
        )}

        {/* Voting Section */}
        {post.isVotingEnabled && post.votingOptions && post.votingOptions.length > 0 && (
          <VotingSection post={post} showNSFW={showNSFW} />
        )}

        {/* Interaction buttons */}
        <div className="flex items-center gap-4 pt-2">
          {isRegisteredUser && !post.isNsfw && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(true)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                {post.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(false)}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                {post.dislikes}
              </Button>
            </>
          )}
          
          {/* Show disabled state for NSFW posts */}
          {post.isNsfw && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Heart className="w-4 h-4" />
                <span className="line-through">Likes Disabled</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                NSFW Content
              </Badge>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
            {post.comments} {showComments ? 'Hide' : 'Show'} Comments
          </Button>
          

        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-4 border-t">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar 
                  className={`w-8 h-8 ${comment.authorId && comment.authorId !== user?.id ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all' : ''}`}
                  onClick={() => handleAvatarClick(comment.authorId)}
                >
                  <AvatarImage src={comment.authorProfileUrl || ''} />
                  <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`font-medium text-sm ${comment.authorId && comment.authorId !== user?.id ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                      onClick={() => handleAvatarClick(comment.authorId)}
                    >
                      {comment.authorAlias || comment.authorName}
                    </span>
                    {comment.authorId && user && user.fame >= 500 && (
                      <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {/* Add Comment */}
            <div className="flex gap-2 pt-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
                rows={2}
              />
              <Button 
                onClick={handleAddComment}
                disabled={commentMutation.isPending || !newComment.trim()}
                size="sm"
              >
                {commentMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PostTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'photo': return <Camera className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
}