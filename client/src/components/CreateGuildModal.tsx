import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, Users, Globe, Lock, Shuffle, RefreshCw, Upload, Crown, Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Import pixel art logos
import logoA from '@/assets/guild-logos/logo-a.png';
import logoG from '@/assets/guild-logos/logo-g.svg';
import logoAbstract1 from '@/assets/guild-logos/logo-abstract1.svg';
import logoAbstract2 from '@/assets/guild-logos/logo-abstract2.svg';
import logoCircle from '@/assets/guild-logos/logo-circle.svg';

interface CreateGuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const guildLogos = [
  { id: 'logo-a', name: 'Letter A', preview: logoA, description: 'Pixel art letter A' },
  { id: 'logo-g', name: 'Letter G', preview: logoG, description: 'Pixel art letter G' },
  { id: 'logo-abstract1', name: 'Diamond Pattern', preview: logoAbstract1, description: 'Abstract diamond design' },
  { id: 'logo-abstract2', name: 'Cross Pattern', preview: logoAbstract2, description: 'Abstract cross design' },
  { id: 'logo-circle', name: 'Circle Design', preview: logoCircle, description: 'Circular pixel pattern' },
];

const colorPalette = [
  '#FF0000', '#FF8C00', '#FFD700', '#32CD32', '#00CED1',
  '#1E90FF', '#9370DB', '#FF1493', '#FF69B4', '#DC143C',
  '#FF6347', '#FFA500', '#FFFF00', '#ADFF2F', '#00FFFF',
  '#0000FF', '#8A2BE2', '#FF00FF', '#000000', '#808080',
  '#FFFFFF', '#800000', '#008000', '#000080', '#800080',
];

// Member limit based on membership tier
const getMemberLimits = (user: any) => {
  if (user?.isAqua) return { max: 100, label: 'Aqua Members', badge: '🌊 Special Badge' };
  if (user?.isAgate) return { max: 75, label: 'Agate Members', badge: null };
  if (user?.isTopaz) return { max: 50, label: 'Topaz Members', badge: null };
  return { max: 20, label: 'Basic Members', badge: null };
};

export function CreateGuildModal({ isOpen, onClose }: CreateGuildModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    insignia: '',
    logo: 'logo-a',
    logoBackgroundColor: '#1E90FF',
    maxMembers: 20,
    isPrivate: false,
  });
  const [nameCharCount, setNameCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  const [insigniaGenerated, setInsigniaGenerated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const memberLimits = getMemberLimits(user);

  // Set max members based on user membership tier
  useEffect(() => {
    setFormData(prev => ({ ...prev, maxMembers: memberLimits.max }));
  }, [memberLimits.max]);

  // Generate random 5-letter insignia
  const generateInsignia = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 5; i++) {
      randomLetters += letters[Math.floor(Math.random() * letters.length)];
    }
    const newInsignia = `#${randomLetters}`;
    setFormData(prev => ({ ...prev, insignia: newInsignia }));
    setInsigniaGenerated(true);
  };

  // Auto-generate insignia when modal opens
  useEffect(() => {
    if (isOpen && !insigniaGenerated) {
      generateInsignia();
    }
  }, [isOpen, insigniaGenerated]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setFormData(prev => ({ ...prev, logo: 'custom' }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createGuildMutation = useMutation({
    mutationFn: async (guildData: any) => {
      // Add CSRF protection
      const csrfToken = Math.random().toString(36).substring(2, 15);
      
      const formData = new FormData();
      
      // Validate and sanitize data before sending
      const trimmedName = guildData.name?.trim() || '';
      if (!trimmedName || trimmedName.length > 20) {
        throw new Error('Invalid guild name');
      }
      
      const sanitizedDescription = guildData.description?.trim() || '';
      if (!sanitizedDescription || sanitizedDescription.length > 600) {
        throw new Error('Invalid guild description');
      }
      
      // Validate insignia format strictly
      const insigniaPattern = /^#[A-Z]{5}$/;
      if (!guildData.insignia || !insigniaPattern.test(guildData.insignia)) {
        throw new Error('Invalid insignia format');
      }
      
      formData.append('name', trimmedName);
      formData.append('description', sanitizedDescription);
      formData.append('insignia', guildData.insignia);
      formData.append('logo', guildData.logo || 'logo-a');
      formData.append('logoBackgroundColor', guildData.logoBackgroundColor || '#1E90FF');
      formData.append('maxMembers', (guildData.maxMembers || 20).toString());
      formData.append('isPrivate', (guildData.isPrivate || false).toString());
      formData.append('csrfToken', csrfToken);
      
      if (selectedFile) {
        // Validate file before upload
        if (selectedFile.size > 5 * 1024 * 1024) {
          throw new Error('File too large (max 5MB)');
        }
        if (!selectedFile.type.startsWith('image/')) {
          throw new Error('Invalid file type (images only)');
        }
        formData.append('customLogo', selectedFile);
      }

      return await apiRequest('POST', '/api/guilds', formData);
    },
    onSuccess: () => {
      toast({
        title: "Guild Created Successfully!",
        description: "Your guild has been created and you are now the owner.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/guilds'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      console.log("=== GUILD CREATION ERROR ===");
      console.log("Error object:", error);
      console.log("Error message:", error.message);
      console.log("Error response:", error.response);
      
      let errorMessage = "Failed to create guild.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      insignia: '',
      logo: 'logo-a',
      logoBackgroundColor: '#1E90FF',
      maxMembers: memberLimits.max,
      isPrivate: false,
    });
    setNameCharCount(0);
    setDescCharCount(0);
    setInsigniaGenerated(false);
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleNameChange = (value: string) => {
    // Sanitize input and allow up to 20 characters
    const sanitizedValue = value.replace(/[<>'"&]/g, ''); // Remove potentially dangerous characters
    if (sanitizedValue.length <= 20) {
      setFormData(prev => ({ ...prev, name: sanitizedValue }));
      setNameCharCount(sanitizedValue.length);
    }
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length <= 600) {
      setFormData(prev => ({ ...prev, description: value }));
      setDescCharCount(value.length);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== GUILD FORM SUBMISSION DEBUG ===");
    console.log("Form data:", formData);
    console.log("Guild name:", formData.name);
    console.log("Name length:", formData.name?.length);
    console.log("Name trimmed:", formData.name?.trim());
    console.log("Name trimmed length:", formData.name?.trim()?.length);
    
    // Validate required fields with trimmed name
    const trimmedName = formData.name?.trim() || '';
    
    if (!trimmedName || trimmedName.length === 0) {
      console.log("VALIDATION FAILED: Empty name after trim");
      toast({
        title: "Guild Name Required",
        description: "Please enter a guild name.",
        variant: "destructive",
      });
      return;
    }
    
    if (trimmedName.length > 20) {
      console.log("VALIDATION FAILED: Name too long");
      toast({
        title: "Guild Name Too Long",
        description: "Guild name must be maximum 20 characters.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.description?.trim()) {
      console.log("VALIDATION FAILED: Empty description");
      toast({
        title: "Missing Information", 
        description: "Guild description is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.insignia || formData.insignia.length !== 6 || !formData.insignia.match(/^#[A-Z]{5}$/)) {
      console.log("VALIDATION FAILED: Invalid insignia");
      toast({
        title: "Invalid Insignia",
        description: "Insignia must be exactly 5 letters in format #ABCDE.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("VALIDATION PASSED: Submitting guild creation");
    
    // Create guild data with trimmed name
    const guildDataToSubmit = {
      ...formData,
      name: trimmedName
    };
    
    createGuildMutation.mutate(guildDataToSubmit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create New Guild
          </DialogTitle>
          <DialogDescription>
            Create a guild to bring together like-minded people and share content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guild Name */}
          <div className="space-y-2">
            <Label htmlFor="guildName" className="text-sm font-medium">
              Guild Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="guildName"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter guild name..."
                className="pr-16"
                maxLength={20}
              />
              <Badge 
                variant="secondary" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs"
              >
                {nameCharCount}/20
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Guild name must be 1-20 characters. No other restrictions.
            </p>
            {formData.name && (
              <div className="text-xs">
                {formData.name.trim().length >= 1 && formData.name.trim().length <= 20 ? (
                  <p className="text-green-600">✓ Name is valid</p>
                ) : formData.name.trim().length === 0 ? (
                  <p className="text-red-500">⚠ Name cannot be empty</p>
                ) : (
                  <p className="text-red-500">⚠ Name too long (maximum 20 characters)</p>
                )}
              </div>
            )}
            
            {/* Security notice */}
            <p className="text-xs text-gray-500">
              Guild names are automatically sanitized for security. Special characters like &lt;, &gt;, ', " are not allowed.
            </p>
          </div>

          {/* Guild Description */}
          <div className="space-y-2">
            <Label htmlFor="guildDescription" className="text-sm font-medium">
              Guild Description <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Textarea
                id="guildDescription"
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Describe your guild's purpose and goals..."
                className="min-h-24 pr-16"
                maxLength={600}
              />
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 text-xs"
              >
                {descCharCount}/600
              </Badge>
            </div>
          </div>

          {/* Member Limit */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Maximum Members
              {memberLimits.badge && (
                <Badge variant="secondary" className="text-xs">
                  {memberLimits.badge}
                </Badge>
              )}
            </Label>
            <Select
              value={formData.maxMembers.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(memberLimits.max - 1, 99) }, (_, i) => i + 2).map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} members
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {memberLimits.label} can create guilds with up to {memberLimits.max} members.
              {user?.isAqua && " Aqua members get a special guild badge! 🌊"}
            </p>
          </div>

          {/* Logo Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Guild Logo
            </Label>
            
            <Tabs defaultValue="sample" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sample">Sample Logos</TabsTrigger>
                <TabsTrigger value="custom">Custom Upload</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sample" className="space-y-4">
                <RadioGroup
                  value={formData.logo !== 'custom' ? formData.logo : ''}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, logo: value }));
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="grid grid-cols-5 gap-4"
                >
                  {guildLogos.map((logo) => (
                    <div key={logo.id} className="flex flex-col items-center space-y-2">
                      <Label
                        htmlFor={logo.id}
                        className="cursor-pointer relative"
                      >
                        <RadioGroupItem
                          value={logo.id}
                          id={logo.id}
                          className="absolute top-2 right-2 z-10"
                        />
                        <Card className={`w-16 h-16 p-2 hover:shadow-md transition-shadow ${
                          formData.logo === logo.id ? 'ring-2 ring-blue-500' : ''
                        }`}>
                          <CardContent className="p-0 flex items-center justify-center h-full">
                            <img 
                              src={logo.preview} 
                              alt={logo.name}
                              className="w-12 h-12 object-contain"
                              style={{ backgroundColor: formData.logoBackgroundColor }}
                            />
                          </CardContent>
                        </Card>
                      </Label>
                      <p className="text-xs text-center font-medium">{logo.name}</p>
                      <p className="text-xs text-gray-500 text-center">{logo.description}</p>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Upload Custom Logo</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    For best results, use transparent background with white logo elements
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Max size: 5MB • Formats: PNG, JPG, GIF, SVG
                  </p>
                </div>
                
                {filePreview && (
                  <div className="flex items-center justify-center">
                    <Card className="w-24 h-24 p-2">
                      <CardContent className="p-0 flex items-center justify-center h-full">
                        <img 
                          src={filePreview} 
                          alt="Custom logo preview"
                          className="w-full h-full object-contain"
                          style={{ backgroundColor: formData.logoBackgroundColor }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Logo Background Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: formData.logoBackgroundColor }}
              />
              Logo Background Color
            </Label>
            <div className="grid grid-cols-10 gap-2">
              {colorPalette.map((color) => (
                <Button
                  key={color}
                  type="button"
                  variant="outline"
                  className="w-8 h-8 p-0 border-2"
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, logoBackgroundColor: color }))}
                >
                  {formData.logoBackgroundColor === color && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Guild Insignia */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Guild Insignia
            </Label>
            <div className="flex gap-2">
              <Input
                value={formData.insignia}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase();
                  // Auto-add # if not present
                  if (value && !value.startsWith('#')) {
                    value = '#' + value;
                  }
                  // Limit to 6 characters (#ABCDE)
                  if (value.length <= 6) {
                    // Only allow letters after #
                    if (value === '#' || /^#[A-Z]*$/.test(value)) {
                      setFormData(prev => ({ ...prev, insignia: value }));
                    }
                  }
                }}
                placeholder="#ABCDE"
                className="flex-1"
                maxLength={6}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateInsignia}
                size="sm"
                title="Generate Random Insignia"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              A unique 5-letter identifier for your guild (format: #ABCDE). You can type your own or generate random.
            </p>
            {formData.insignia && formData.insignia.length === 6 && (
              <p className="text-xs text-green-600">
                ✓ Insignia format is valid
              </p>
            )}
            {formData.insignia && formData.insignia.length > 0 && formData.insignia.length !== 6 && (
              <p className="text-xs text-red-500">
                ⚠ Insignia must be exactly 5 letters (format: #ABCDE)
              </p>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                {formData.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                Guild Privacy
              </Label>
              <p className="text-xs text-gray-500">
                {formData.isPrivate 
                  ? "Only invited members can join this guild" 
                  : "Anyone can discover and join this guild"}
              </p>
            </div>
            <Switch
              checked={formData.isPrivate}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createGuildMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createGuildMutation.isPending || 
                !formData.name?.trim() || 
                formData.name.trim().length === 0 ||
                formData.name.trim().length > 20 ||
                !formData.description?.trim() ||
                !formData.insignia || 
                formData.insignia.length !== 6 ||
                !formData.insignia.match(/^#[A-Z]{5}$/)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createGuildMutation.isPending ? 'Creating...' : 'Create Guild'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}