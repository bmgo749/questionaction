import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { 
  ArrowLeft, 
  Users, 
  Crown, 
  Shield, 
  Settings, 
  UserPlus, 
  Mail, 
  Plus,
  MessageSquare,
  Heart,
  MessageCircle,
  Calendar,
  Home,
  BookOpen,
  Trophy,
  Star,
  Trash2,
  UserMinus,
  LogOut
} from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { useAuth } from '@/hooks/useAuth';

// Guild logos mapping
const guildLogos = {
  logo1: '🛡️',
  logo2: '👑',
  logo3: '⭐',
  logo4: '⚔️',
  logo5: '🐲',
};

interface Guild {
  id: number;
  name: string;
  description: string;
  insignia: string;
  logo: string;
  logoBackgroundColor: string;
  isPrivate: boolean;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  postCount: number;
  members: any[];
  userRole: string;
  createdAt: string;
}

interface GuildPost {
  id: number;
  title: string;
  content: string;
  type: 'photo' | 'video' | 'discussion';
  mediaUrl?: string;
  authorId: string;
  authorName: string;
  authorAlias?: string;
  authorProfileUrl?: string;
  likes: number;
  dislikes: number;
  comments: number;
  createdAt: string;
}

const leaveGuildSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type LeaveGuildData = z.infer<typeof leaveGuildSchema>;

export default function GuildDetail() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeSection, setActiveSection] = useState<'hall' | 'posts'>('hall');
  const [isLeaveGuildOpen, setIsLeaveGuildOpen] = useState(false);

  const leaveForm = useForm<LeaveGuildData>({
    resolver: zodResolver(leaveGuildSchema),
    defaultValues: {
      password: ""
    }
  });

  // Extract guild ID from current URL (works with both secure and regular routing)
  const extractGuildId = () => {
    const currentPath = window.location.pathname;
    const hashPath = window.location.hash.replace('#', '');
    
    // Check hash first (for secure URLs)
    if (hashPath && hashPath.startsWith('guild/')) {
      const id = hashPath.split('/')[1];
      return id ? parseInt(id) : null;
    }
    
    // Check regular path (for direct access)
    if (currentPath.startsWith('/guild/')) {
      const id = currentPath.split('/')[2];
      return id ? parseInt(id) : null;
    }
    
    return null;
  };

  const guildId = extractGuildId();

  // Handle member profile clicks
  const handleMemberClick = (memberId: string) => {
    if (memberId && memberId !== user?.id) {
      // Navigate to member's public profile using secure URL
      const code = Math.random().toString(36).substring(2, 15);
      const errorCode = Math.random().toString(36).substring(2, 8);
      window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#user/${memberId}`;
    }
  };

  // Fetch guild details
  const { data: guild, isLoading: guildLoading, error: guildError } = useQuery({
    queryKey: [`/api/guilds/${guildId}`],
    enabled: !!guildId,
    retry: 3,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });



  // Fetch guild posts
  const { data: guildPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: [`/api/guilds/${guildId}/posts`],
    enabled: !!guildId,
  });

  // Debug guild posts
  console.log("Guild posts data:", guildPosts);
  console.log("Guild posts loading:", postsLoading);
  console.log("Guild posts count:", guildPosts.length);

  // Send invite mutation
  const sendInviteMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest('POST', `/api/guilds/${guildId}/invite`, { email });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Invite sent successfully!',
      });
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: [`/api/guilds/${guildId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Leave guild mutation
  const leaveGuildMutation = useMutation({
    mutationFn: async (data: LeaveGuildData) => {
      return await apiRequest('POST', `/api/guilds/${guildId}/leave`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Successfully left the guild',
      });
      // Redirect to guilds page using secure URL
      const code = Math.random().toString(36).substring(2, 15);
      const errorCode = Math.random().toString(36).substring(2, 8);
      window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#guilds`;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete guild mutation
  const deleteGuildMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/guilds/${guildId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Guild deleted successfully',
      });
      // Redirect to guilds page using secure URL
      const code = Math.random().toString(36).substring(2, 15);
      const errorCode = Math.random().toString(36).substring(2, 8);
      window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#guilds`;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest('DELETE', `/api/guild-posts/${postId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/guilds/${guildId}/posts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/guilds/${guildId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSendInvite = () => {
    if (!inviteEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }
    sendInviteMutation.mutate(inviteEmail);
  };

  const onSubmitLeaveGuild = async (data: LeaveGuildData) => {
    try {
      await leaveGuildMutation.mutateAsync(data);
      setIsLeaveGuildOpen(false);
      leaveForm.reset();
    } catch (error) {
      console.error('Leave guild error:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || colors.member}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const canManageGuild = guild?.userRole === 'owner' || guild?.userRole === 'admin';

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest('POST', `/api/guild-posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guilds/${guildId}/posts`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Comment state
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [viewingCommentsPostId, setViewingCommentsPostId] = useState<number | null>(null);

  // Comment post mutation
  const commentPostMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      return await apiRequest('POST', `/api/guild-posts/${postId}/comment`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guilds/${guildId}/posts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/guild-posts/${commentingPostId}/comments`] });
      setCommentingPostId(null);
      setCommentText('');
      toast({
        title: 'Success',
        description: 'Comment added successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleCommentPost = (postId: number) => {
    setCommentingPostId(postId);
  };

  const handleViewComments = (postId: number) => {
    setViewingCommentsPostId(viewingCommentsPostId === postId ? null : postId);
  };

  // Fetch comments for a specific post
  const { data: postComments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/guild-posts/${viewingCommentsPostId}/comments`],
    enabled: !!viewingCommentsPostId,
  });

  const handleSubmitComment = (postId: number) => {
    if (!commentText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }
    commentPostMutation.mutate({ postId, content: commentText });
  };

  if (guildLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading guild...</div>
        </div>
      </Layout>
    );
  }

  if (guildError) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Error Loading Guild</CardTitle>
              <CardDescription>
                Error: {guildError.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <SecureLink href="/guilds">Back to Guilds</SecureLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!guild) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Guild Not Found</CardTitle>
              <CardDescription>
                The guild you're looking for doesn't exist or you don't have access.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <SecureLink href="/guilds">Back to Guilds</SecureLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex">
        {/* Extended Left Navbar */}
        <div className="w-64 bg-transparent border-r border-gray-200 dark:border-gray-800 flex-shrink-0 min-h-screen relative overflow-y-auto">
            <div className="p-4 pt-20">
              {/* Back to Guilds Button */}
              <SecureLink href="/guilds">
                <Button variant="outline" size="sm" className="w-full mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Guilds
                </Button>
              </SecureLink>

              {/* Navigation */}
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveSection('hall')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'hall' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Guild Hall</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('posts')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'posts' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Guild Posts</span>
                </button>
              </div>

              {/* Guild Stats */}
              <div className="p-4 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Guild Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
                    <span className="text-sm font-medium">{guild.memberCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Posts</span>
                    <span className="text-sm font-medium">{guild.postCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Guild Honor</span>
                    <span className="text-sm font-medium">{(((guild.postCount || 0) * 0.1) + ((guild.memberCount || 0) * 0.05)).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
              {activeSection === 'hall' && (
                <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Guild Hall
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Welcome to the {guild.name} guild hall. Here you can view guild information, member details, and track guild achievements.
                </p>
              </div>

              {/* Guild Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Guild Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Guild Name</Label>
                      <p className="text-lg font-semibold">{guild.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                      <p className="text-gray-600 dark:text-gray-400">{guild.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Insignia</Label>
                      <p className="text-lg font-mono">{guild.insignia}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy</Label>
                      <Badge variant={guild.isPrivate ? "secondary" : "outline"}>
                        {guild.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {guild.createdAt ? new Date(guild.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Guild Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Members</span>
                        <span className="text-xl font-bold">{guild.memberCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Guild Owner</span>
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span 
                            className="font-medium cursor-pointer hover:text-blue-500 hover:underline transition-colors"
                            onClick={() => handleMemberClick(guild.ownerId)}
                          >
                            {guild.ownerName}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {guild.members && guild.members.length > 0 ? (
                          guild.members.slice(0, 5).map((member: any) => (
                            <div key={member.userId} className="flex items-center justify-between">
                              <span 
                                className="text-sm cursor-pointer hover:text-blue-500 hover:underline transition-colors"
                                onClick={() => handleMemberClick(member.userId)}
                              >
                                {member.username}
                              </span>
                              {getRoleIcon(member.role)}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Member list will appear here once available.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Guild Honor System */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Guild Honor System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {(((guild.postCount || 0) * 0.1) + ((guild.memberCount || 0) * 0.05)).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Guild Honor</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {((guild.postCount || 0) * 0.1).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">From Posts</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {((guild.memberCount || 0) * 0.05).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">From Members</div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Honor System:</strong> Guild honor increases by 0.1 for each post created plus bonus points based on likes and engagement.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-4">
                {guild.userRole !== 'owner' ? (
                  <Dialog open={isLeaveGuildOpen} onOpenChange={setIsLeaveGuildOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave Guild
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Leave Guild</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to leave this guild? This action cannot be undone. Please enter your password to confirm.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...leaveForm}>
                        <form onSubmit={leaveForm.handleSubmit(onSubmitLeaveGuild)} className="space-y-4">
                          <FormField
                            control={leaveForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsLeaveGuildOpen(false);
                                leaveForm.reset();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              variant="destructive"
                              disabled={leaveGuildMutation.isPending}
                            >
                              {leaveGuildMutation.isPending ? "Leaving..." : "Leave Guild"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button asChild className="flex-1">
                    <SecureLink href={`/postguild?guild=${guild.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </SecureLink>
                  </Button>
                )}
                {canManageGuild && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Member</DialogTitle>
                        <DialogDescription>
                          Send an email invitation to join {guild.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="invite-email">Email Address</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setInviteEmail('')}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSendInvite}
                            disabled={sendInviteMutation.isPending}
                          >
                            {sendInviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* Guild Owner Actions */}
                {guild.userRole === 'owner' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Guild
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Guild</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to permanently delete "{guild.name}"? This action cannot be undone and will remove all posts, members, and data associated with this guild.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => deleteGuildMutation.mutate()}
                          disabled={deleteGuildMutation.isPending}
                        >
                          {deleteGuildMutation.isPending ? 'Deleting...' : 'Delete Guild'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                

              </div>
            </div>
          )}

          {activeSection === 'posts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Guild Posts</h2>
                <Button asChild>
                  <SecureLink href={`/postguild?guild=${guild.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </SecureLink>
                </Button>
              </div>
              
              {postsLoading ? (
                <div className="text-center py-8">Loading posts...</div>
              ) : guildPosts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Be the first to share something with the guild!
                  </p>
                  <Button asChild>
                    <SecureLink href={`/postguild?guild=${guild.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Post
                    </SecureLink>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {guildPosts.map((post: GuildPost) => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {post.authorProfileUrl ? (
                                <img 
                                  src={post.authorProfileUrl} 
                                  alt={post.authorName}
                                  className="w-8 h-8 rounded-full object-cover bg-transparent"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-transparent border border-gray-300 rounded-full flex items-center justify-center">
                                  <Users className="h-4 w-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{post.authorName}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  {post.guildName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Guild Post
                            </Badge>
                            {/* Delete post button for author or guild owner */}
                            {(post.authorId === user?.id || guild.userRole === 'owner') && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Post</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete this post? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => deletePostMutation.mutate(post.id)}
                                      disabled={deletePostMutation.isPending}
                                    >
                                      {deletePostMutation.isPending ? 'Deleting...' : 'Delete Post'}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>{post.content}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {post.mediaUrl && (
                          <div className="mb-4">
                            {post.type === 'photo' && (
                              <img 
                                src={post.mediaUrl} 
                                alt={post.title}
                                className="w-full max-w-md rounded-lg"
                              />
                            )}
                            {post.type === 'video' && (
                              <video 
                                src={post.mediaUrl} 
                                className="w-full max-w-md rounded-lg"
                                controls
                              />
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <button 
                            className="flex items-center gap-1 hover:text-red-500 transition-colors"
                            onClick={() => handleLikePost(post.id)}
                          >
                            <Heart className="h-4 w-4" />
                            <span>{post.likes}</span>
                          </button>
                          <button 
                            className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                            onClick={() => handleViewComments(post.id)}
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button 
                            className="flex items-center gap-1 hover:text-green-500 transition-colors"
                            onClick={() => handleCommentPost(post.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>Reply</span>
                          </button>
                        </div>
                        
                        {/* Comment Section */}
                        {commentingPostId === post.id && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex gap-3">
                              <Input
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSubmitComment(post.id);
                                  }
                                }}
                              />
                              <Button 
                                size="sm"
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={commentPostMutation.isPending}
                              >
                                {commentPostMutation.isPending ? 'Posting...' : 'Post'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setCommentingPostId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Comments Display */}
                        {viewingCommentsPostId === post.id && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium mb-3">Comments ({post.comments})</h4>
                            {commentsLoading ? (
                              <div className="text-center py-4">Loading comments...</div>
                            ) : postComments.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                No comments yet. Be the first to comment!
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {postComments.map((comment: any) => (
                                  <div key={comment.id} className="flex gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                                    <div className="flex-shrink-0">
                                      {comment.authorProfileUrl ? (
                                        <img 
                                          src={comment.authorProfileUrl} 
                                          alt={comment.authorName}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                          <Users className="h-4 w-4" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{comment.authorName}</span>
                                        {comment.authorIq && (
                                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                            IQ: {comment.authorIq}
                                          </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                          {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </Layout>
  );
}