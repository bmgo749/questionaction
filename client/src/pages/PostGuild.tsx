import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { ArrowLeft, Upload, ImageIcon, VideoIcon, MessageSquare, Plus } from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { useAuth } from '@/hooks/useAuth';

const createGuildPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content must be less than 2000 characters'),
  type: z.enum(['photo', 'video', 'discussion']),
  guildId: z.number(),
});

type CreateGuildPostData = z.infer<typeof createGuildPostSchema>;

export default function PostGuild() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get guild ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const guildId = urlParams.get('guild') ? parseInt(urlParams.get('guild')!) : null;

  // Get user's guilds for selection
  const { data: userGuilds = [] } = useQuery({
    queryKey: ['/api/guilds/my'],
    enabled: !!user,
  });

  const form = useForm<CreateGuildPostData>({
    resolver: zodResolver(createGuildPostSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'discussion',
      guildId: guildId || undefined,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreateGuildPostData & { mediaFile?: File }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('type', data.type);
      formData.append('guildId', data.guildId.toString());
      
      if (data.mediaFile) {
        formData.append('media', data.mediaFile);
      }

      const response = await fetch('/api/guild-posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Guild post created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guilds', data.guildId, 'posts'] });
      // Use secure routing for success navigation
      const code = Math.random().toString(36).substring(2, 15);
      const errorCode = Math.random().toString(36).substring(2, 8);
      window.location.href = `/v2/?code=${code}&errorCode=${errorCode}#guild/${data.guildId}`;
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only image (JPEG, PNG, GIF) and video (MP4, WebM) files are allowed',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-select post type based on file type
    if (file.type.startsWith('image/')) {
      form.setValue('type', 'photo');
    } else if (file.type.startsWith('video/')) {
      form.setValue('type', 'video');
    }
  };

  const onSubmit = (data: CreateGuildPostData) => {
    if ((data.type === 'photo' || data.type === 'video') && !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file for photo or video posts',
        variant: 'destructive',
      });
      return;
    }

    createPostMutation.mutate({
      ...data,
      mediaFile: selectedFile || undefined,
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You must be logged in to create guild posts.
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

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Create Guild Post
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Share content with your guild members
                </p>
              </div>
              <Button asChild variant="outline">
                <SecureLink href="/guilds">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Guilds
                </SecureLink>
              </Button>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
                <CardDescription>
                  Fill in the details for your guild post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="guildId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guild</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a guild" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userGuilds.map((guild: any) => (
                                <SelectItem key={guild.id} value={guild.id.toString()}>
                                  {guild.name} ({guild.insignia})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select post type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="discussion">
                                <div className="flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Discussion
                                </div>
                              </SelectItem>
                              <SelectItem value="photo">
                                <div className="flex items-center">
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Photo
                                </div>
                              </SelectItem>
                              <SelectItem value="video">
                                <div className="flex items-center">
                                  <VideoIcon className="w-4 h-4 mr-2" />
                                  Video
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter post title" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give your post a catchy title (3-100 characters)
                          </FormDescription>
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
                              placeholder="Write your post content here..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Share your thoughts, ideas, or information (10-2000 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* File Upload */}
                    {(form.watch('type') === 'photo' || form.watch('type') === 'video') && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {form.watch('type') === 'photo' ? 'Photo' : 'Video'}
                          </label>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Select File
                            </Button>
                            {selectedFile && (
                              <span className="text-sm text-gray-600">
                                {selectedFile.name}
                              </span>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={form.watch('type') === 'photo' ? 'image/*' : 'video/*'}
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>

                        {/* File Preview */}
                        {filePreview && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Preview:</p>
                            {form.watch('type') === 'photo' ? (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="max-h-64 rounded-lg object-cover"
                              />
                            ) : (
                              <video
                                src={filePreview}
                                controls
                                className="max-h-64 rounded-lg"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end space-x-4">
                      <SecureLink href="/guilds">
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </SecureLink>
                      <Button
                        type="submit"
                        disabled={createPostMutation.isPending}
                      >
                        {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}