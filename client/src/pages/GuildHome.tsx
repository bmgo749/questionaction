import React, { useState } from "react";
import { useParams } from "wouter";
import { SecureLink } from '@/components/SecureRouter';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Lock, 
  Globe, 
  Crown, 
  Shield, 
  User, 
  Mail, 
  UserPlus, 
  Check, 
  X, 
  ArrowLeft,
  Calendar,
  Hash,
  MessageSquare,
  Plus,
  Image,
  Trophy,
  Camera,
  Edit,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be 2000 characters or less"),
  postType: z.enum(['text', 'image', 'discussion']),
});

const leaveGuildSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type CreatePostData = z.infer<typeof createPostSchema>;
type LeaveGuildData = z.infer<typeof leaveGuildSchema>;

interface GuildMember {
  id: number;
  guildId: number;
  userId: string;
  username: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface GuildPost {
  id: number;
  guildId: number;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  postType: 'text' | 'image' | 'discussion';
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

interface GuildDetails {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  ownerId: string;
  ownerName: string;
  insignia: string;
  logo: string;
  logoBackgroundColor: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  members: GuildMember[];
  userRole: 'owner' | 'admin' | 'member';
  honorPoints: number;
}

export default function GuildHome() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditGuildOpen, setIsEditGuildOpen] = useState(false);
  const [isLeaveGuildOpen, setIsLeaveGuildOpen] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const guildId = parseInt(id as string);

  const form = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      postType: "text"
    }
  });

  const leaveForm = useForm<LeaveGuildData>({
    resolver: zodResolver(leaveGuildSchema),
    defaultValues: {
      password: ""
    }
  });

  // Fetch guild details
  const { data: guild, isLoading, error } = useQuery<GuildDetails>({
    queryKey: ["/api/guilds", guildId],
    enabled: isAuthenticated && !isNaN(guildId),
  });



  // Get guild posts with race condition protection
  const { data: guildPosts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['guild-posts', guild?.id],
    queryFn: async () => {
      if (!guild?.id) {
        return [];
      }

      const response = await fetch(`/api/guilds/${guild.id}/posts`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guild posts');
      }

      const posts = await response.json();
      return posts;
    },
    enabled: !!guild?.id && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      return await apiRequest("POST", `/api/guilds/${guildId}/posts`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      form.reset();
      setIsCreatePostOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/guilds", guildId, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guilds", guildId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update guild description mutation (owner only)
  const updateGuildMutation = useMutation({
    mutationFn: async (description: string) => {
      return await apiRequest("PUT", `/api/guilds/${guildId}`, { description });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Guild description updated successfully!",
      });
      setIsEditGuildOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/guilds", guildId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Leave guild mutation
  const leaveGuildMutation = useMutation({
    mutationFn: async (data: LeaveGuildData) => {
      return await apiRequest("POST", `/api/guilds/${guildId}/leave`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully left the guild.",
      });
      setIsLeaveGuildOpen(false);
      leaveForm.reset();
      // Redirect to guilds page using secure URL
      const code = Math.random().toString(36).substring(2, 15);
      const errorCode = Math.random().toString(36).substring(2, 8);
      window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#guilds`;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitPost = (data: CreatePostData) => {
    createPostMutation.mutate(data);
  };

  const onSubmitLeaveGuild = (data: LeaveGuildData) => {
    leaveGuildMutation.mutate(data);
  };

  const handleUpdateDescription = () => {
    if (!newDescription.trim()) {
      toast({
        title: "Error",
        description: "Description cannot be empty",
        variant: "destructive",
      });
      return;
    }
    updateGuildMutation.mutate(newDescription);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to be logged in to access guild home.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => {
                const code = Math.random().toString(36).substring(2, 15);
                const errorCode = Math.random().toString(36).substring(2, 8);
                window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#auth`;
              }}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading guild...</div>
        </div>
      </Layout>
    );
  }

  if (error || !guild) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have access to this guild or it doesn't exist.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <SecureLink href="/guilds">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Guilds
                </SecureLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <SecureLink href="/guilds">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Guilds
              </SecureLink>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-black dark:text-white">
                  {guild.name}
                </h1>
                <span className="text-gray-500 dark:text-gray-400 text-lg font-mono">
                  {guild.insignia}
                </span>
                {guild.isPrivate ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Owner: {guild.ownerName}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="posts">Guild Posts</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Guild Info */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Guild Information
                      </CardTitle>
                      {guild.userRole === 'owner' && (
                        <Dialog open={isEditGuildOpen} onOpenChange={setIsEditGuildOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setNewDescription(guild.description)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Guild Description</DialogTitle>
                              <DialogDescription>
                                Update your guild's description. Only the owner can edit this.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                  id="description"
                                  value={newDescription}
                                  onChange={(e) => setNewDescription(e.target.value)}
                                  placeholder="Enter guild description"
                                  rows={4}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditGuildOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleUpdateDescription}
                                  disabled={updateGuildMutation.isPending}
                                >
                                  {updateGuildMutation.isPending ? "Updating..." : "Update"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {guild.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{guild.memberCount} {guild.memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span>{guild.postCount} posts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span>{guild.honorPoints || 0} honor points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>Created {new Date(guild.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Leave Guild Button - Only show for non-owners */}
                    {(guild.userRole === 'member' || guild.userRole === 'admin') && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Dialog open={isLeaveGuildOpen} onOpenChange={setIsLeaveGuildOpen}>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="lg" className="w-full">
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Guild Members */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Members ({guild.memberCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {guild.members?.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {member.role === 'owner' && <Crown className="h-4 w-4 text-yellow-500" />}
                            {member.role === 'admin' && <Shield className="h-4 w-4 text-blue-500" />}
                            <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {guild.members && guild.members.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{guild.members.length - 5} more members
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Leave Guild Button - Only show for non-owners in Guild Hall */}
            {guild.userRole !== 'owner' && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center">
                  <Dialog open={isLeaveGuildOpen} onOpenChange={setIsLeaveGuildOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="lg">
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
                </div>
              </div>
            )}
          </TabsContent>

          {/* Guild Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Guild Posts</h2>
              <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>
                      Share something with your guild members
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitPost)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter post title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Write your post content..." 
                                rows={6}
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
                          onClick={() => setIsCreatePostOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPostMutation.isPending}
                        >
                          {createPostMutation.isPending ? "Creating..." : "Create Post"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="text-lg">Loading posts...</div>
                </div>
              ) : guildPosts && guildPosts.length > 0 ? (
                guildPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{post.postType}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.commentCount} comments
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {post.likeCount} likes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Be the first to create a post in this guild!
                  </p>
                  <Button onClick={() => setIsCreatePostOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}