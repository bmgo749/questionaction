import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Download, Repeat2, Camera, FileText, X, ThumbsDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { IQBadge } from "@/components/IQBadge";

interface Post {
  id: number;
  type: 'image' | 'discussion';
  title: string;
  content: string | null;
  imageUrl: string | null;
  authorId: string | null;
  authorName: string;
  authorIp: string;
  likes: number;
  dislikes: number;
  comments: number;
  downloads: number;
  reposts: number;
  originalPostId: number | null;
  createdAt: string;
}

interface PostComment {
  id: number;
  postId: number;
  content: string;
  authorId: string | null;
  authorName: string;
  authorIp: string;
  authorIq: number | null;
  createdAt: string;
}

interface CreatePostForm {
  type: 'image' | 'discussion';
  title: string;
  content: string;
  image?: File;
}

export default function PageFeed() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePostForm>({
    type: 'discussion',
    title: '',
    content: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});

  const queryClient = useQueryClient();

  // Fetch all posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setShowCreateForm(false);
      setCreateForm({ type: 'discussion', title: '', content: '' });
      setSelectedImage(null);
      setImagePreview(null);
    },
  });

  // Like/dislike post mutation
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: number; type: 'like' | 'dislike' }) => {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });

  // Download tracking mutation
  const downloadMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`/api/posts/${postId}/download`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to track download');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });

  // Repost mutation
  const repostMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to repost');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setCreateForm({ ...createForm, type: 'image' });
    }
  };

  const handleSubmitPost = () => {
    if (!createForm.title.trim()) return;

    const formData = new FormData();
    formData.append('type', createForm.type);
    formData.append('title', createForm.title);
    formData.append('content', createForm.content);

    if (selectedImage && createForm.type === 'image') {
      formData.append('image', selectedImage);
    }

    createPostMutation.mutate(formData);
  };

  const handleDownload = async (post: Post) => {
    if (post.imageUrl) {
      // Track download
      downloadMutation.mutate(post.id);
      
      // Download the image
      try {
        const response = await fetch(post.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${post.title}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const toggleComments = (postId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const PostComments = ({ postId }: { postId: number }) => {
    const { data: comments = [] } = useQuery<PostComment[]>({
      queryKey: [`/api/posts/${postId}/comments`],
      enabled: expandedComments.has(postId),
    });

    return (
      <div className="mt-4 space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {comment.authorName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.authorName}</span>
                {comment.authorIq && <IQBadge iqScore={comment.authorIq} size="sm" />}
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}
        
        <div className="flex gap-3 mt-3">
          <Textarea
            placeholder="Write a comment..."
            value={commentTexts[postId] || ''}
            onChange={(e) => setCommentTexts(prev => ({ ...prev, [postId]: e.target.value }))}
            className="flex-1"
            rows={2}
          />
          <Button
            onClick={() => commentMutation.mutate({ postId, content: commentTexts[postId] || '' })}
            disabled={!commentTexts[postId]?.trim() || commentMutation.isPending}
            size="sm"
          >
            Post
          </Button>
        </div>
      </div>
    );
  };

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {post.authorName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.authorName}</h3>
                <Badge variant={post.type === 'image' ? 'default' : 'secondary'}>
                  {post.type === 'image' ? 'Image' : 'Discussion'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </p>
            </div>
          </div>
          {post.originalPostId && (
            <Badge variant="outline" className="text-blue-600">
              <Repeat2 className="h-3 w-3 mr-1" />
              Repost
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <h2 className="text-xl font-bold mb-3">{post.title}</h2>
        
        {post.content && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
        )}
        
        {post.imageUrl && (
          <div className="mb-4">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(post.imageUrl!, '_blank')}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likePostMutation.mutate({ postId: post.id, type: 'like' })}
              className="flex items-center gap-2 hover:text-red-600"
            >
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likePostMutation.mutate({ postId: post.id, type: 'dislike' })}
              className="flex items-center gap-2 hover:text-gray-600"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleComments(post.id)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            
            {post.imageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(post)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>{post.downloads}</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => repostMutation.mutate({ postId: post.id, content: '' })}
              className="flex items-center gap-2"
            >
              <Repeat2 className="h-4 w-4" />
              <span>{post.reposts}</span>
            </Button>
          </div>
        </div>
        
        {expandedComments.has(post.id) && <PostComments postId={post.id} />}
      </CardContent>
    </Card>
  );

  if (postsLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-32"></Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Page - Social Feed</h1>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            Create Post
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create New Post</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={createForm.type === 'discussion' ? 'default' : 'outline'}
                  onClick={() => setCreateForm({ ...createForm, type: 'discussion' })}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Discussion
                </Button>
                <Button
                  variant={createForm.type === 'image' ? 'default' : 'outline'}
                  onClick={() => setCreateForm({ ...createForm, type: 'image' })}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Image Post
                </Button>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  placeholder="What's on your mind?"
                  rows={4}
                />
              </div>

              {createForm.type === 'image' && (
                <div>
                  <Label htmlFor="image">Upload Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg" />
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleSubmitPost}
                disabled={!createForm.title.trim() || createPostMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-500 mb-4">No posts yet. Be the first to share something!</p>
                <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </Layout>
  );
}