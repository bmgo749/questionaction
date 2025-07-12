import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, UpdateProfile } from '@shared/schema';
import { Edit, Crown, Calendar, Mail, User as UserIcon, AlignLeft, Camera, X, Upload, Trophy, Award } from 'lucide-react';
import { MembershipBadges } from '@/components/MembershipBadges';
import { useLocation } from 'wouter';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfile>({});
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [stableProfileImage, setStableProfileImage] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: Infinity, // Never consider data stale to prevent photo changes
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Don't refetch on mount to avoid photo flickering
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchInterval: false, // Disable auto refetch
    refetchIntervalInBackground: false, // Disable background refetch
    enabled: true, // Always enabled
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile & { profileImageFile?: File }) => {
      // Keep current profile image if no new image is uploaded
      let profileImageUrl = user?.profileImageUrl || '';
      
      if (data.profileImageFile) {
        console.log('Uploading profile image:', data.profileImageFile.name);
        const formData = new FormData();
        formData.append('profile', data.profileImageFile);
        
        const uploadResponse = await fetch('/api/upload/profile', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          profileImageUrl = uploadResult.url;
          console.log('Profile image uploaded:', uploadResult.url);
        } else {
          console.error('Upload failed:', await uploadResponse.text());
          throw new Error('Failed to upload profile image');
        }
      }
      
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        aliasName: data.aliasName,
        description: data.description,
        profileImageUrl: profileImageUrl,
      };
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: (updatedUser) => {
      console.log('Profile update successful:', updatedUser);
      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      });
      setIsEditing(false);
      setProfileImageFile(null);
      setProfileImagePreview('');
      
      // Directly update the cache with new data without invalidation
      queryClient.setQueryData(['/api/auth/user'], updatedUser);
      
      // Update form data and stable image immediately
      setFormData({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        aliasName: updatedUser.aliasName || '',
        description: updatedUser.description || '',
        profileImageUrl: updatedUser.profileImageUrl || '',
      });
      setStableProfileImage(updatedUser.profileImageUrl || '');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user && !isEditing) {
      // Only update form data when not editing to prevent photo flickering
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        aliasName: user.aliasName || '',
        description: user.description || '',
        profileImageUrl: user.profileImageUrl || '',
      });
      // Set stable profile image that won't change during editing
      setStableProfileImage(user.profileImageUrl || '');
    }
  }, [user, isEditing]);

  // Initialize stable image only once and lock it permanently
  useEffect(() => {
    if (user && !stableProfileImage) {
      setStableProfileImage(user.profileImageUrl || '');
    }
  }, [user?.id]); // Only depend on user ID to prevent re-runs

  // Create a locked profile image that doesn't change during editing
  const displayedProfileImage = useMemo(() => {
    if (profileImagePreview) {
      return profileImagePreview; // Show preview when uploading new image
    }
    if (isEditing && stableProfileImage) {
      return stableProfileImage; // Use locked image during editing
    }
    return user?.profileImageUrl || ''; // Use current user image when not editing
  }, [profileImagePreview, isEditing, stableProfileImage, user?.profileImageUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    updateProfileMutation.mutate({
      ...formData,
      profileImageFile: profileImageFile || undefined,
    });
    setShowSaveConfirm(false);
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      aliasName: user?.aliasName || '',
      description: user?.description || '',
      profileImageUrl: user?.profileImageUrl || '',
    });
    setProfileImageFile(null);
    setProfileImagePreview('');
    setStableProfileImage(user?.profileImageUrl || ''); // Reset to original image
    setShowCancelConfirm(false);
  };

  const handleInputChange = (field: keyof UpdateProfile, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Image must be smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setProfileImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Exit Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation('/')}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Exit Profile
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
        <CardContent className="relative p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 -mt-16">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage
                  src={stableProfileImage || user.profileImageUrl || '/default-avatar.png'}
                  alt={`${user.firstName || ''} ${user.lastName || ''}`}
                />
                <AvatarFallback className="bg-orange-500 text-white text-2xl font-bold">
                  {getInitials(user.firstName || undefined, user.lastName || undefined)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white dark:bg-gray-800"
                onClick={() => {
                  // Lock current profile image before editing starts
                  if (user?.profileImageUrl) {
                    setStableProfileImage(user.profileImageUrl);
                  }
                  setIsEditing(true);
                  document.getElementById('profile-image-input')?.click();
                }}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h1>
                {user.aliasName && (
                  <Badge variant="secondary" className="text-sm">
                    @{user.aliasName}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{user.fame || 0} Honor</span>
                </div>
                {user.iqTestTaken && user.iqScore && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">IQ {user.iqScore}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
              
              {user.description && (
                <p className="text-gray-700 dark:text-gray-300 max-w-md">
                  {user.description}
                </p>
              )}
            </div>
            
            <Button
              onClick={() => {
                // Lock current profile image before editing starts
                if (user?.profileImageUrl) {
                  setStableProfileImage(user.profileImageUrl);
                }
                setIsEditing(true);
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {user.provider?.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Authentication
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Honor & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Honor Points */}
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-yellow-500">
                  {user.fame || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Honor Points
                </div>
                <div className="text-xs text-gray-500">
                  Earn honor by creating articles and getting likes!
                </div>
              </div>

              {/* All Badges Display */}
              <div className="text-center space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Badges & Status</h4>
                <div className="flex justify-center">
                  <MembershipBadges 
                    isTopaz={user.isTopaz || false}
                    isAgate={user.isAgate || false}
                    isAqua={user.isAqua || false}
                    isModerator={user.isModerator || false}
                    isStaff={user.isStaff || false}
                    isDeveloper={user.isDeveloper || false}
                    hasBasicDB={user.hasBasicDB || true}
                    hasInterDB={user.hasInterDB || false}
                    hasProDB={user.hasProDB || false}
                    transparentBackground={true}
                    className="scale-150"
                  />
                </div>
                
                {/* Badge Descriptions */}
                <div className="space-y-2 text-xs text-gray-500">
                  {/* Staff Badges */}
                  {(user.isModerator || user.isStaff || user.isDeveloper) && (
                    <div>
                      <p className="font-medium text-red-600">Staff Badges:</p>
                      <p>
                        {user.isModerator && "Moderator • "}
                        {user.isStaff && "Staff • "}
                        {user.isDeveloper && "Developer"}
                      </p>
                    </div>
                  )}
                  
                  {/* Membership Badges */}
                  {(user.isTopaz || user.isAgate || user.isAqua) && (
                    <div>
                      <p className="font-medium text-purple-600">Membership:</p>
                      <p>
                        {user.isAqua && "Aqua Premium • "}
                        {user.isAgate && "Agate Premium • "}
                        {user.isTopaz && "Topaz Premium"}
                      </p>
                    </div>
                  )}
                  
                  {/* Database Badges */}
                  {(user.hasBasicDB || user.hasInterDB || user.hasProDB) && (
                    <div>
                      <p className="font-medium text-blue-600">Database Plans:</p>
                      <p>
                        {user.hasProDB && "Pro++ DB • "}
                        {user.hasInterDB && "Inter+ DB • "}
                        {user.hasBasicDB && "Basic DB"}
                      </p>
                    </div>
                  )}
                  
                  {(!user.isTopaz && !user.isAgate && !user.isAqua && !user.isModerator && !user.isStaff && !user.isDeveloper) && (
                    <p>Free user • Basic DB plan</p>
                  )}
                </div>
              </div>

              {/* Achievements */}
              <div className="text-center space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Achievements
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Award className="w-5 h-5" />
                    <span className="text-sm">Coming Soon</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Achievements system is in development</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Alias Name</label>
                <Input
                  value={formData.aliasName || ''}
                  onChange={(e) => handleInputChange('aliasName', e.target.value)}
                  placeholder="Enter your alias (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Profile Photo</label>
                <div className="flex items-center gap-3">
                  {/* Show current profile image or preview of new image */}
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-gray-300">
                      <AvatarImage 
                        src={displayedProfileImage} 
                        alt="Profile" 
                      />
                      <AvatarFallback className="text-sm">
                        {getInitials(formData.firstName || user?.firstName, formData.lastName || user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {profileImagePreview && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      id="edit-profile-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('edit-profile-image')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {profileImageFile ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {profileImageFile && (
                      <p className="text-xs text-gray-500 mt-1">{profileImageFile.name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Changes?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to cancel? All unsaved changes will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Editing
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancel}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Dialog */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Changes?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to save these changes to your profile?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSaveConfirm(false)}
              >
                Keep Editing
              </Button>
              <Button
                onClick={confirmSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Yes, Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}