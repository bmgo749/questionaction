import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Save, Upload, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Palette, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { categories } from '@/data/categories';

const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  categories: z.array(z.string()).min(1, 'At least one category is required').max(3, 'Maximum 3 categories allowed'),
  thumbnail: z.string().optional(),
  language: z.string().default('en'),
});

type CreateArticleForm = z.infer<typeof createArticleSchema>;

export default function CreateArticle() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Content formatting state
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textAlign, setTextAlign] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  
  // File upload state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const form = useForm<CreateArticleForm>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: '',
      content: '',
      categories: [],
      thumbnail: '',
      language: language,
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
        thumbnail: thumbnailUrl,
        language: data.language,
      };
      
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create article');
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
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create article. Please try again.',
        variant: 'destructive',
      });
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
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        setIsBold(!isBold);
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        setIsItalic(!isItalic);
        break;
      default:
        return;
    }
    
    const newValue = textArea.value.substring(0, start) + formattedText + textArea.value.substring(end);
    form.setValue('content', newValue);
    
    // Restore focus and selection
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
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
              <div className="flex flex-wrap gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mt-2">
                <Button
                  type="button"
                  variant={isBold ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFormatting('bold')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={isItalic ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFormatting('italic')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={textAlign === 'left' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextAlign('left')}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={textAlign === 'center' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextAlign('center')}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={textAlign === 'right' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextAlign('right')}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                      <SelectItem value="24">24px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm">Text:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border"
                  />
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
                rows={15}
                className="mt-1"
                style={{
                  fontSize: `${fontSize}px`,
                  color: textColor,
                  backgroundColor: '#000000',
                  textAlign: textAlign as any,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                }}
              />
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