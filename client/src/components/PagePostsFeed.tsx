import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, MessageCircle, ThumbsDown, ThumbsUp, Camera, Video, FileText, CheckCircle2, ExternalLink, AlertTriangle, X, Calendar } from "lucide-react";
import { format } from "date-fns";
import { SecureLink } from '@/components/SecureRouter';
import { useToast } from "@/hooks/use-toast";
// import { useUser } from "@/hooks/use-user";
import type { PagePost } from "@shared/schema";

interface PagePostsFeedProps {
  showNSFW?: boolean;
}

export default function PagePostsFeed({ showNSFW = false }: PagePostsFeedProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // const { user } = useUser();
  const [nsfwConsent, setNsfwConsent] = useState(() => {
    return localStorage.getItem('nsfwConsent') === 'true' || showNSFW;
  });
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [currentNsfwPost, setCurrentNsfwPost] = useState<PagePost | null>(null);

  // Update consent when showNSFW prop changes
  useEffect(() => {
    if (showNSFW) {
      setNsfwConsent(true);
    }
  }, [showNSFW]);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Fetch recent page posts (limited to 6 for home page)
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/page-posts', showNSFW],
    queryFn: async () => {
      const url = showNSFW ? '/api/page-posts?includeNsfw=true' : '/api/page-posts';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch page posts');
      const allPosts = await response.json() as PagePost[];
      return allPosts.slice(0, 6); // Show only latest 6 posts
    },
  });

  // Fetch recent guild posts
  const { data: guildPosts = [], isLoading: guildPostsLoading } = useQuery({
    queryKey: ['/api/guild-posts/all'],
    queryFn: async () => {
      const response = await fetch('/api/guild-posts/all');
      if (!response.ok) throw new Error('Failed to fetch guild posts');
      return response.json();
    },
  });

  // Combine regular posts and guild posts, then sort by creation date
  const allPosts = [...posts, ...guildPosts.map((guildPost, index) => ({
    ...guildPost,
    id: guildPost.id || `guild-${index}`, // Ensure unique ID for guild posts
    isGuildPost: true,
    guildName: guildPost.guildName,
    guildBannerColor: guildPost.guildBannerColor || '#3B82F6', // Default blue color
  }))].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Show posts based on NSFW toggle and consent - limit to 6 total posts
  const filteredPosts = allPosts.slice(0, 6);

  const handleAgeVerification = (isAdult: boolean) => {
    if (isAdult) {
      setNsfwConsent(true);
      localStorage.setItem('nsfwConsent', 'true');
      toast({
        title: "Age verified",
        description: "NSFW content will now be shown.",
      });
    }
    setShowAgeVerification(false);
    setCurrentNsfwPost(null);
  };

  // Fetch current user data
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Like/dislike mutation for regular page posts
  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLike }: { postId: number; isLike: boolean }) => {
      const response = await fetch(`/api/page-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isLike }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like mutation for guild posts
  const guildPostLikeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/guild-posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guild-posts/all'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const PostTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading || guildPostsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Page Posts</h2>
        </div>
        <div className="text-center py-8">Loading posts...</div>
      </div>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Page Posts</h2>
          <SecureLink href="/page">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View All Posts
            </Button>
          </SecureLink>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to share something on Page!
            </p>
            <SecureLink href="/page">
              <Button>Create First Post</Button>
            </SecureLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRegisteredUser = !!user;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Page Posts</h2>
        <SecureLink href="/page">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            View All Posts
          </Button>
        </SecureLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          <Card key={post.isGuildPost ? `guild-${post.id}-${index}` : `post-${post.id}-${index}`} className="group hover:shadow-lg transition-shadow duration-200 relative bg-transparent border-2 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.authorProfileUrl || ''} />
                  <AvatarFallback className="text-xs">{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div>
                      <h3 className="font-semibold text-sm truncate">
                        {post.authorAlias || post.authorName}
                      </h3>
                      {post.isGuildPost && post.guildName && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {post.guildName}
                        </p>
                      )}
                    </div>
                    {post.authorId && user && user.fame >= 500 && (
                      <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <PostTypeIcon type={post.type} />
                      {post.type}
                    </Badge>
                    {post.isNsfw && (
                      <Badge variant="destructive" className="text-xs">NSFW</Badge>
                    )}
                    {post.isGuildPost && (
                      <Badge 
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium px-2 py-1"
                      >
                        Guild Post
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(post.createdAt), 'MMM d')}
                    </span>
                  </div>
                </div>
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
                      <Badge variant="destructive" className="text-xs">Click to view</Badge>
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
                    <Badge variant="destructive" className="text-xs">Click to view</Badge>
                  </div>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {post.content}
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
                    <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-2">Video</span>
                    </div>
                  )}
                </div>
              )}

              {post.isVotingEnabled && post.votingQuestion && (
                <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs font-medium mb-2 line-clamp-2">{post.votingQuestion}</p>
                  <Badge variant="secondary" className="text-xs">
                    {post.votingOptions?.length || 0} options
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Only show like/dislike buttons for registered users' non-NSFW posts */}
                  {post.authorId && !post.isNsfw && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!currentUser) return;
                        if (post.isGuildPost) {
                          guildPostLikeMutation.mutate(post.id);
                        } else {
                          likeMutation.mutate({ postId: post.id, isLike: true });
                        }
                      }}
                      disabled={!currentUser || likeMutation.isPending || guildPostLikeMutation.isPending}
                      className="flex items-center gap-1 text-xs p-1 h-auto"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes}
                    </Button>
                  )}
                  
                  {/* Show static like count for NSFW posts without interaction */}
                  {post.isNsfw && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Heart className="w-3 h-3" />
                      <span className="line-through">Disabled</span>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs p-1 h-auto"
                  >
                    <MessageCircle className="w-3 h-3" />
                    {post.comments}
                  </Button>
                </div>

                {!post.isNsfw && (
                  <SecureLink href={`/page?id=${post.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View
                    </Button>
                  </SecureLink>
                )}
              </div>

              {!currentUser && (
                <p className="text-xs text-gray-500 text-center">
                  <SecureLink href="/auth" className="text-blue-500 hover:underline">Login</SecureLink> to interact
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length >= 6 && (
        <div className="text-center">
          <SecureLink href="/page">
            <Button variant="outline" className="flex items-center gap-2">
              View More Posts
              <ExternalLink className="w-4 h-4" />
            </Button>
          </SecureLink>
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
            
            <div className="text-xs text-gray-500 text-center">
              By clicking "Yes", you confirm that you are 18 years or older and consent to viewing adult content.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}