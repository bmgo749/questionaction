import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Palette, Crown, Diamond, Droplets, Lock } from 'lucide-react';

const Settings = () => {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState(user?.selectedTheme || 'cosmic');
  
  // Sync selected theme with user data when user data changes
  useEffect(() => {
    if (user?.selectedTheme) {
      setSelectedTheme(user.selectedTheme);
    }
  }, [user?.selectedTheme]);

  const updateThemeMutation = useMutation({
    mutationFn: (theme: string) => apiRequest('/api/user/theme', {
      method: 'POST',
      body: { theme }
    }),
    onSuccess: (data) => {
      // Update local state immediately
      setSelectedTheme(data.selectedTheme);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      refetch();
      toast({
        title: "Theme updated!",
        description: "Your theme has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update theme.",
        variant: "destructive",
      });
    }
  });

  // Check if user can access specific themes based on membership
  const canAccessTheme = (theme: string): boolean => {
    if (theme === 'cosmic') return true; // Everyone can access cosmic theme
    if (theme === 'topaz') return user?.isTopaz || user?.isAgate || user?.isAqua;
    if (theme === 'agate') return user?.isAgate || user?.isAqua;
    if (theme === 'aqua') return user?.isAqua;
    return false;
  };

  const themes = [
    {
      id: 'cosmic',
      name: 'Cosmic Galaxy',
      description: 'Default theme with stars and cosmic background',
      icon: Palette,
      color: 'from-blue-500 to-purple-600',
      free: true
    },
    {
      id: 'topaz',
      name: 'Topaz Golden',
      description: 'Luxurious golden-orange theme with warm crystals',
      icon: Crown,
      color: 'from-yellow-400 to-orange-500',
      free: false,
      membershipRequired: 'Topaz'
    },
    {
      id: 'agate',
      name: 'Agate Silver',
      description: 'Elegant silver-gray theme with sophisticated crystals',
      icon: Diamond,
      color: 'from-gray-300 to-gray-600',
      free: false,
      membershipRequired: 'Agate'
    },
    {
      id: 'aqua',
      name: 'Aqua Ocean',
      description: 'Refreshing ocean-blue theme with water crystals',
      icon: Droplets,
      color: 'from-cyan-400 to-blue-600',
      free: false,
      membershipRequired: 'Aqua'
    }
  ];

  const handleThemeChange = (themeId: string) => {
    if (!canAccessTheme(themeId)) {
      toast({
        title: "Premium Theme Required",
        description: `You need ${themes.find(t => t.id === themeId)?.membershipRequired} membership to access this theme.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedTheme(themeId);
    updateThemeMutation.mutate(themeId);
  };

  return (
    <Layout>
      <div className={`min-h-screen relative overflow-hidden ${
        selectedTheme === 'topaz' ? 'bg-gradient-to-br from-orange-400/20 to-yellow-400/20' :
        selectedTheme === 'agate' ? 'bg-gradient-to-br from-gray-400/20 to-gray-700/20' :
        selectedTheme === 'aqua' ? 'bg-gradient-to-br from-cyan-400/20 to-blue-600/20' :
        'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
      }`}>
        
        {/* Animated Stars Background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full opacity-80 animate-pulse ${
                selectedTheme === 'topaz' ? 'bg-orange-300' :
                selectedTheme === 'agate' ? 'bg-gray-300' :
                selectedTheme === 'aqua' ? 'bg-cyan-300' :
                'bg-white'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-4 text-white">
                Theme Settings
              </h1>
              <p className="text-xl text-gray-300">
                Customize your experience with premium themes
              </p>
            </div>

            {/* User Membership Status */}
            <Card className="mb-8 bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Your Membership Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-200">
                  {user?.isAqua && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-600 text-white">
                      Aqua Member - All Themes Unlocked
                    </span>
                  )}
                  {user?.isAgate && !user?.isAqua && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-white">
                      Agate Member - Topaz & Agate Themes
                    </span>
                  )}
                  {user?.isTopaz && !user?.isAgate && !user?.isAqua && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-600 text-white">
                      Topaz Member - Topaz Theme Only
                    </span>
                  )}
                  {user?.isFree && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white">
                      Free Member - Cosmic Theme Only
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Theme Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((theme) => {
                const IconComponent = theme.icon;
                const isAccessible = canAccessTheme(theme.id);
                const isSelected = selectedTheme === theme.id;
                
                return (
                  <Card 
                    key={theme.id}
                    className={`relative cursor-pointer transition-all duration-300 backdrop-blur-md ${
                      isSelected 
                        ? 'border-2 border-white bg-white/20 scale-105' 
                        : 'border border-white/20 bg-white/10 hover:bg-white/15'
                    } ${!isAccessible ? 'opacity-60' : ''}`}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    {!isAccessible && (
                      <div className="absolute top-2 right-2 z-10">
                        <Lock className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full bg-gradient-to-r ${theme.color}`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-white">
                        {theme.name}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {theme.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {theme.free ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-600 text-white">
                            Free Theme
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-600 text-white">
                            {theme.membershipRequired} Required
                          </span>
                        )}
                        
                        <Button 
                          className={`w-full transition-all duration-300 ${
                            isSelected 
                              ? 'bg-white text-black hover:bg-gray-200' 
                              : isAccessible 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-600 hover:bg-gray-700 text-gray-300 cursor-not-allowed'
                          }`}
                          disabled={!isAccessible || updateThemeMutation.isPending}
                        >
                          {isSelected ? 'Currently Active' : isAccessible ? 'Select Theme' : 'Upgrade Required'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Upgrade Notice */}
            {user?.isFree && (
              <Card className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30">
                <CardHeader>
                  <CardTitle className="text-white text-center">
                    Unlock Premium Themes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-300 mb-4">
                    Upgrade your membership to access beautiful premium themes with unique backgrounds, crystals, and animations.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={() => window.location.href = '/market'}
                  >
                    View Membership Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;