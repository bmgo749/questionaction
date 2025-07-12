import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Save, Upload, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Palette, Lightbulb, X, Lock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { categories } from '@/data/categories';

const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  categories: z.array(z.string()).min(1, 'At least one category is required').max(3, 'Maximum 3 categories allowed'),
  hashtags: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  language: z.string().default('en'),
  enableForum: z.boolean().default(false),
});

type CreateArticleForm = z.infer<typeof createArticleSchema>;

export default function CreateArticle() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Form state
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  
  // Content formatting state
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textAlign, setTextAlign] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  
  // Advanced formatting for per-line styling
  const [currentLineFormat, setCurrentLineFormat] = useState({
    bold: false,
    italic: false,
    fontSize: '16',
    color: '#000000',
    align: 'left',
    fontFamily: 'Inter'
  });
  
  // File upload state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // Check authentication status
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You must be logged in to create articles. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/auth');
      }, 2000);
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  // Show loading or authentication required message
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 animate-spin border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You must be logged in to create articles. You will be redirected to the login page.
            </p>
            <Button onClick={() => setLocation('/auth')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const form = useForm<CreateArticleForm>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: '',
      content: '',
      categories: [],
      hashtags: [],
      thumbnail: '',
      language: language,
      enableForum: false,
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: CreateArticleForm & { thumbnailFile?: File }) => {
      // If there's a thumbnail file, upload it first
      let thumbnailUrl = data.thumbnail;
      
      if (data.thumbnailFile) {
        const formData = new FormData();
        formData.append('thumbnail', data.thumbnailFile);
        
        const uploadResponse = await fetch('/api/upload/thumbnail', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          thumbnailUrl = uploadResult.url;
        }
      }
      
      const articleData = {
        title: data.title,
        content: data.content,
        categories: data.categories,
        hashtags: data.hashtags || [],
        thumbnail: thumbnailUrl,
        language: data.language,
        enableForum: data.enableForum,
      };
      
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requireAuth) {
          throw new Error('authentication_required');
        }
        throw new Error(errorData.message || 'Failed to create article');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Article Created',
        description: 'Your article has been published successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setLocation('/');
    },
    onError: (error: Error) => {
      if (error.message === 'authentication_required') {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to create articles.',
          variant: 'destructive',
        });
        setLocation('/auth');
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create article',
          variant: 'destructive',
        });
      }
    },
  });

  const onSubmit = (data: CreateArticleForm) => {
    createArticleMutation.mutate({ ...data, thumbnailFile: thumbnailFile ?? undefined });
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    form.setValue('thumbnail', '');
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      const newHashtags = [...hashtags, hashtagInput.trim()];
      setHashtags(newHashtags);
      form.setValue('hashtags', newHashtags);
      setHashtagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    const newHashtags = hashtags.filter((_, i) => i !== index);
    setHashtags(newHashtags);
    form.setValue('hashtags', newHashtags);
  };

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    const currentCategories = form.getValues('categories');
    if (checked && currentCategories.length < 3) {
      form.setValue('categories', [...currentCategories, categorySlug]);
    } else if (!checked) {
      form.setValue('categories', currentCategories.filter(cat => cat !== categorySlug));
    }
  };

  const applyFormatting = (format: string) => {
    const textArea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const selectedText = textArea.value.substring(start, end);
    
    let formattedText = '';
    let formatTag = '';
    
    switch (format) {
      case 'bold':
        formattedText = selectedText ? `**${selectedText}**` : '****';
        setCurrentLineFormat(prev => ({ ...prev, bold: !prev.bold }));
        break;
      case 'italic':
        formattedText = selectedText ? `*${selectedText}*` : '**';
        setCurrentLineFormat(prev => ({ ...prev, italic: !prev.italic }));
        break;
      case 'newline-reset':
        // Insert new line with reset formatting
        formatTag = `\n<div style="font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${textColor}; text-align: ${textAlign}; font-weight: normal; font-style: normal;">`;
        formattedText = formatTag + (selectedText || 'Type here...') + '</div>';
        setCurrentLineFormat({
          bold: false,
          italic: false,
          fontSize: '16',
          color: '#000000',
          align: 'left',
          fontFamily: 'Inter'
        });
        break;
      case 'line-style':
        // Apply current formatting to current line
        const styles = [];
        if (currentLineFormat.bold) styles.push('font-weight: bold');
        if (currentLineFormat.italic) styles.push('font-style: italic');
        styles.push(`font-family: ${currentLineFormat.fontFamily}`);
        styles.push(`font-size: ${currentLineFormat.fontSize}px`);
        styles.push(`color: ${currentLineFormat.color}`);
        styles.push(`text-align: ${currentLineFormat.align}`);
        
        formatTag = `<div style="${styles.join('; ')};">`;
        formattedText = formatTag + (selectedText || 'Type here...') + '</div>';
        break;
      default:
        return;
    }
    
    const newValue = textArea.value.substring(0, start) + formattedText + textArea.value.substring(end);
    form.setValue('content', newValue);
    
    // Restore focus and selection
    setTimeout(() => {
      textArea.focus();
      const newPosition = start + formattedText.length;
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const resetCurrentLineFormatting = () => {
    setCurrentLineFormat({
      bold: false,
      italic: false,
      fontSize: '16',
      color: '#000000',
      align: 'left',
      fontFamily: 'Inter'
    });
  };

  const selectedCategories = form.watch('categories');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glow-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              {t('article.create')}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/')}
              type="button"
            >
              <X className="h-4 w-4 mr-2" />
              Exit Creation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">{t('article.title')}</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder={t('article.titlePlaceholder')}
                className="mt-1"
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Categories Selection */}
            <div>
              <Label>{t('article.categories')} (Max 3)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {categories.map((category) => (
                  <div key={category.slug} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.slug}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={(checked) => handleCategoryChange(category.slug, checked as boolean)}
                      disabled={!selectedCategories.includes(category.slug) && selectedCategories.length >= 3}
                    />
                    <Label htmlFor={category.slug} className="text-sm">
                      {t(`categories.${category.id}`)}
                    </Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.categories && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.categories.message}</p>
              )}
            </div>

            {/* Hashtags */}
            <div>
              <Label htmlFor="hashtags">Hashtags (Optional)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="hashtags"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="Enter hashtag (without #)"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addHashtag}
                  disabled={!hashtagInput.trim()}
                >
                  Add
                </Button>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((hashtag, index) => (
                    <div key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
                      <span>#{hashtag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHashtag(index)}
                        className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Forum Discussion Option */}
            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableForum"
                  checked={form.watch('enableForum')}
                  onCheckedChange={(checked) => form.setValue('enableForum', checked as boolean)}
                />
                <Label htmlFor="enableForum" className="text-sm">
                  Enable Forum Discussion
                </Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Allow readers to discuss and comment on this article
              </p>
            </div>

            {/* Thumbnail */}
            <div>
              <Label htmlFor="thumbnail">{t('article.thumbnail')} (Optional)</Label>
              
              {/* File Upload Option */}
              <div className="mt-2">
                <input
                  type="file"
                  id="thumbnailFile"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => document.getElementById('thumbnailFile')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image File
                </Button>
              </div>
              
              {/* URL Input Option */}
              <div className="flex gap-2 mt-2">
                <Input
                  id="thumbnail"
                  {...form.register('thumbnail')}
                  placeholder="Or enter image URL: https://example.com/image.jpg"
                  className="flex-1"
                  value={thumbnailPreview ? '' : form.getValues('thumbnail')}
                  disabled={!!thumbnailPreview}
                />
              </div>
              
              {/* Preview */}
              {thumbnailPreview && (
                <div className="mt-2 relative">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeThumbnail}
                    className="absolute top-1 right-1"
                  >
                    ×
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {thumbnailFile?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Content Formatting Toolbar */}
            <div>
              <Label>{t('article.formatting')}</Label>
              <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mt-2">
                {/* Basic Formatting */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={currentLineFormat.bold ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyFormatting('bold')}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={currentLineFormat.italic ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyFormatting('italic')}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  
                  {/* Apply Line Styling */}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => applyFormatting('line-style')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Type className="h-4 w-4 mr-1" />
                    Apply Style
                  </Button>
                  
                  {/* New Line with Reset */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyFormatting('newline-reset')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    New Line Reset
                  </Button>
                  
                  {/* Reset Current Format */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetCurrentLineFormatting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset Format
                  </Button>
                </div>

                {/* Current Line Format Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="lineSize" className="text-xs">Font Size</Label>
                    <Input
                      id="lineSize"
                      type="number"
                      min="8"
                      max="72"
                      value={currentLineFormat.fontSize}
                      onChange={(e) => setCurrentLineFormat(prev => ({ ...prev, fontSize: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lineColor" className="text-xs">Text Color</Label>
                    <Input
                      id="lineColor"
                      type="color"
                      value={currentLineFormat.color}
                      onChange={(e) => setCurrentLineFormat(prev => ({ ...prev, color: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lineFont" className="text-xs">Font Family</Label>
                    <Select
                      value={currentLineFormat.fontFamily}
                      onValueChange={(value) => setCurrentLineFormat(prev => ({ ...prev, fontFamily: value }))}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  💡 Tip: Set formatting options above, then click "Apply Style" to format selected text. Use "New Line Reset" to start a new paragraph with default formatting.
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">{t('article.content')}</Label>
              <Textarea
                id="content"
                {...form.register('content')}
                placeholder={t('article.contentPlaceholder')}
                className="mt-1 min-h-[300px]"
                style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  color: textColor,
                  backgroundColor: backgroundColor,
                  textAlign: textAlign as 'left' | 'center' | 'right',
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                }}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 Use the formatting tools above to create styled content with different fonts per line. HTML and inline styles are supported.
              </div>
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
              )}
            </div>

            {/* Language */}
            <div>
              <Label htmlFor="language">{t('article.language')}</Label>
              <Select
                value={form.watch('language')}
                onValueChange={(value) => form.setValue('language', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="my">Bahasa Melayu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={createArticleMutation.isPending}
            >
              {createArticleMutation.isPending ? (
                t('article.creating')
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('article.publish')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}