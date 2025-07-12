import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera, Video, FileText, Plus, X, Home } from "lucide-react";
import { useLocation } from "wouter";
import { SecureLink } from '@/components/SecureRouter';
import { HashtagInput } from "@/components/HashtagInput";

interface CreatePostData {
  type: 'photo' | 'discussion' | 'video';
  title: string;
  content: string;
  mediaFile?: File;
  isVotingEnabled: boolean;
  votingQuestion: string;
  votingOptions: string[];
  hashtags: string[];
  isNsfw: boolean;
}

export default function PageCreate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [createPostData, setCreatePostData] = useState<CreatePostData>({
    type: 'discussion',
    title: '',
    content: '',
    isVotingEnabled: false,
    votingQuestion: '',
    votingOptions: ['', ''],
    hashtags: [],
    isNsfw: false
  });

  // Create page post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('isVotingEnabled', data.isVotingEnabled.toString());
      formData.append('hashtags', JSON.stringify(data.hashtags));
      formData.append('isNsfw', data.isNsfw.toString());
      
      if (data.isVotingEnabled) {
        formData.append('votingTitle', data.votingQuestion);
        formData.append('votingQuestion', data.votingQuestion);
        formData.append('votingOptions', JSON.stringify(data.votingOptions.filter(opt => opt.trim())));
      }
      
      if (data.mediaFile) {
        formData.append('media', data.mediaFile);
      }

      const response = await fetch('/api/page-posts', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/page-posts'] });
      setCreatePostData({
        type: 'discussion',
        title: '',
        content: '',
        isVotingEnabled: false,
        votingQuestion: '',
        votingOptions: ['', ''],
        hashtags: [],
        isNsfw: false
      });
      toast({
        title: "Post created successfully!",
        description: "Your post has been shared on the Page.",
      });
      // Redirect to page after successful creation
      setTimeout(() => {
        setLocation('/page');
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddVotingOption = () => {
    setCreatePostData(prev => ({
      ...prev,
      votingOptions: [...prev.votingOptions, '']
    }));
  };

  const handleRemoveVotingOption = (index: number) => {
    setCreatePostData(prev => ({
      ...prev,
      votingOptions: prev.votingOptions.filter((_, i) => i !== index)
    }));
  };

  const handleVotingOptionChange = (index: number, value: string) => {
    setCreatePostData(prev => ({
      ...prev,
      votingOptions: prev.votingOptions.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleCreatePost = () => {
    if (!createPostData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    if (createPostData.isVotingEnabled) {
      if (!createPostData.votingQuestion.trim()) {
        toast({
          title: "Voting question required",
          description: "Please add a voting question.",
          variant: "destructive",
        });
        return;
      }

      const validOptions = createPostData.votingOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({
          title: "At least 2 voting options required",
          description: "Please add at least 2 voting options.",
          variant: "destructive",
        });
        return;
      }
    }

    createPostMutation.mutate(createPostData);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-gray-600 dark:text-gray-400">Share something with the Queit community</p>
        </div>
        
        <div className="flex gap-3">
          <SecureLink href="/page">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Back to Page
            </Button>
          </SecureLink>
        </div>
      </div>

      {/* Create Post Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Post Type</label>
              <Select 
                value={createPostData.type} 
                onValueChange={(value: 'photo' | 'discussion' | 'video') => 
                  setCreatePostData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Discussion
                    </div>
                  </SelectItem>
                  <SelectItem value="photo">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Photo
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Title (Optional)</label>
              <Input 
                value={createPostData.title}
                onChange={(e) => setCreatePostData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Add a title..."
              />
            </div>
          </div>

          {(createPostData.type === 'photo' || createPostData.type === 'video') && (
            <div>
              <label className="text-sm font-medium">Upload {createPostData.type}</label>
              <Input
                type="file"
                accept={createPostData.type === 'photo' ? 'image/*' : 'video/*'}
                onChange={(e) => setCreatePostData(prev => ({ ...prev, mediaFile: e.target.files?.[0] }))}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={createPostData.content}
              onChange={(e) => setCreatePostData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-sm font-medium mb-2 block">Hashtags</label>
            <HashtagInput
              hashtags={createPostData.hashtags}
              onChange={(hashtags) => setCreatePostData(prev => ({ ...prev, hashtags }))}
              isNsfw={createPostData.isNsfw}
              placeholder="Add hashtags to make your post discoverable..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableVoting"
              checked={createPostData.isVotingEnabled}
              onChange={(e) => setCreatePostData(prev => ({ ...prev, isVotingEnabled: e.target.checked }))}
            />
            <label htmlFor="enableVoting" className="text-sm font-medium">Enable Voting</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableNsfw"
              checked={createPostData.isNsfw}
              onChange={(e) => setCreatePostData(prev => ({ ...prev, isNsfw: e.target.checked }))}
            />
            <label htmlFor="enableNsfw" className="text-sm font-medium text-red-600">NSFW Content (18+)</label>
          </div>

          {createPostData.isVotingEnabled && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div>
                <label className="text-sm font-medium">Voting Question</label>
                <Input
                  value={createPostData.votingQuestion}
                  onChange={(e) => setCreatePostData(prev => ({ ...prev, votingQuestion: e.target.value }))}
                  placeholder="What question do you want to ask?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Voting Options</label>
                {createPostData.votingOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <Input
                      value={option}
                      onChange={(e) => handleVotingOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {createPostData.votingOptions.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveVotingOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddVotingOption}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending}
              className="flex-1"
            >
              {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
            </Button>
            <SecureLink href="/page">
              <Button variant="outline">
                Cancel
              </Button>
            </SecureLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}