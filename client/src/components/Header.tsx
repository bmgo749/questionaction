import { useEffect, useState } from 'react';
import { Settings, LogOut, User as UserIcon, Crown, Brain, Palette, Diamond, Droplets, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SecureLink } from '@/components/SecureRouter';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { MobileMenu } from './MobileMenu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useIQStatus } from '@/hooks/useIQStatus';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/data/categories';
import logoImage from '../assets/logo.png';

export function Header() {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading, refetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState(user?.selectedTheme || 'cosmic');
  
  // Auto-refresh user data every 15 minutes to keep profile up-to-date
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refetch();
      }, 15 * 60 * 1000); // 15 minutes - minimal disruption
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refetch]);
  
  // Sync selected theme with user data
  useEffect(() => {
    if (user?.selectedTheme) {
      setSelectedTheme(user.selectedTheme);
    }
  }, [user?.selectedTheme]);
  
  const { data: iqStatus } = useIQStatus();

  const updateThemeMutation = useMutation({
    mutationFn: async (theme: string) => {
      const response = await apiRequest('POST', '/api/user/theme', { theme });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedTheme(data.selectedTheme);
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
    if (!isAuthenticated) return false; // Must be logged in for premium themes
    if (theme === 'topaz') return user?.isTopaz || user?.isAgate || user?.isAqua;
    if (theme === 'agate') return user?.isAgate || user?.isAqua;
    if (theme === 'aqua') return user?.isAqua;
    return false;
  };

  const membershipThemes = [
    {
      id: 'topaz',
      name: 'Topaz Golden',
      icon: Crown,
      free: false,
      membershipRequired: 'Topaz',
      color: 'text-yellow-500'
    },
    {
      id: 'agate',
      name: 'Agate Silver',
      icon: Diamond,
      free: false,
      membershipRequired: 'Agate',
      color: 'text-gray-500'
    },
    {
      id: 'aqua',
      name: 'Aqua Ocean',
      icon: Droplets,
      free: false,
      membershipRequired: 'Aqua',
      color: 'text-cyan-500'
    }
  ];

  const handleThemeChange = (themeId: string) => {
    // Basic themes (dark, light, auto) can be used without authentication
    const basicThemes = ['dark', 'light', 'auto'];
    
    if (basicThemes.includes(themeId)) {
      if (isAuthenticated) {
        setSelectedTheme(themeId);
        updateThemeMutation.mutate(themeId);
      } else {
        // For non-authenticated users, just update the local theme
        setTheme(themeId);
      }
      return;
    }

    // Premium themes require authentication
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to access premium themes.",
        variant: "destructive",
      });
      return;
    }

    if (!canAccessTheme(themeId)) {
      const theme = membershipThemes.find(t => t.id === themeId);
      toast({
        title: "Premium Theme Required",
        description: `You need ${theme?.membershipRequired} membership to access this theme.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedTheme(themeId);
    updateThemeMutation.mutate(themeId);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <header className="bg-white dark:bg-black border-b border-black dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <SecureLink href="/">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                {/* Logo tanpa lingkaran, sama besar untuk light dan dark mode */}
                <div className="w-10 h-10 mr-3">
                  <img 
                    src={logoImage} 
                    alt="Queit logo" 
                    className="w-full h-full object-contain filter invert dark:invert-0"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Queit</h1>
              </div>
            </div>
          </SecureLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            <SecureLink href="/">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Home
              </span>
            </SecureLink>
            <SecureLink href="/categories">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Category
              </span>
            </SecureLink>
            <SecureLink href="/trending">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Trending
              </span>
            </SecureLink>
            <SecureLink href="/market">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Market
              </span>
            </SecureLink>
            <SecureLink href="/question">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Help
              </span>
            </SecureLink>
            <SecureLink href="/page">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Page
              </span>
            </SecureLink>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* User Profile or Login */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.profileImageUrl || '/default-avatar.png'} 
                        alt={`${user.firstName || ''} ${user.lastName || ''}`}
                      />
                      <AvatarFallback className="bg-orange-500 text-white text-xs">
                        {getInitials(user.firstName || undefined, user.lastName || undefined)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.aliasName && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          @{user.aliasName}
                        </Badge>
                      )}
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                            {user.fame || 0} Honor
                          </span>
                        </div>
                        {user.iqTestTaken && user.iqScore && (
                          <div className="flex items-center gap-1">
                            <Brain className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              IQ {user.iqScore}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <SecureLink href="/profile">
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </SecureLink>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SecureLink href="/auth">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Login
                </Button>
              </SecureLink>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Guild Button */}
            <SecureLink href="/guilds">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Guilds</span>
              </Button>
            </SecureLink>

            {/* Brain Icon - Clickable IQ Test Link - Shows until test is taken */}
            {iqStatus && !iqStatus.iqTestTaken && (
              <SecureLink href="/iq-test">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Brain className="h-5 w-5" />
                  <span className="sr-only">IQ Test</span>
                </Button>
              </SecureLink>
            )}

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t('settings.title')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t('settings.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-4">
                  {/* Basic Theme Section - Only show if no premium theme is selected */}
                  {!['topaz', 'agate', 'aqua'].includes(selectedTheme) && (
                    <>
                      <div className="mb-4">
                        <Label className="text-sm font-medium mb-2 block">Basic Theme</Label>
                        <RadioGroup value={selectedTheme} onValueChange={handleThemeChange}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="dark" id="basic-dark" />
                              <Label htmlFor="basic-dark">Dark</Label>
                            </div>
                            {selectedTheme === 'dark' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="light" id="basic-light" />
                              <Label htmlFor="basic-light">Light</Label>
                            </div>
                            {selectedTheme === 'light' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="auto" id="basic-auto" />
                              <Label htmlFor="basic-auto">Auto</Label>
                            </div>
                            {selectedTheme === 'auto' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </RadioGroup>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Membership-based Premium Themes */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Premium Theme</Label>
                      <div className="space-y-2">
                        {membershipThemes.map((themeOption) => {
                          const IconComponent = themeOption.icon;
                          const isAccessible = canAccessTheme(themeOption.id);
                          const isSelected = selectedTheme === themeOption.id;
                          
                          return (
                            <div 
                              key={themeOption.id}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              } ${!isAccessible ? 'opacity-60 cursor-not-allowed' : ''}`}
                              onClick={() => handleThemeChange(themeOption.id)}
                            >
                              <div className="flex items-center gap-2">
                                <IconComponent className={`w-4 h-4 ${themeOption.color}`} />
                                <span className="text-sm">{themeOption.name}</span>
                                <Badge variant="outline" className="text-xs">{themeOption.membershipRequired}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {!isAccessible && <Lock className="w-3 h-3 text-red-400" />}
                                {isSelected && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Back to Basic Theme button - Only show if premium theme is active */}
                      {['topaz', 'agate', 'aqua'].includes(selectedTheme) && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleThemeChange('dark')}
                          >
                            Back to Basic Theme
                          </Button>
                        </div>
                      )}

                      {/* Membership Status Display */}
                      <div className="mt-3 p-2 rounded bg-gray-50 dark:bg-gray-800">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {isAuthenticated ? (
                            <>
                              Your Plan: 
                              {user?.isAqua && <span className="ml-1 text-cyan-600 font-medium">Aqua (All Premium Themes)</span>}
                              {user?.isAgate && !user?.isAqua && <span className="ml-1 text-gray-600 font-medium">Agate (Topaz + Agate Themes)</span>}
                              {user?.isTopaz && !user?.isAgate && !user?.isAqua && <span className="ml-1 text-yellow-600 font-medium">Topaz (Topaz Theme Only)</span>}
                              {user?.isFree && <span className="ml-1 text-green-600 font-medium">Free (Basic Themes Only)</span>}
                            </>
                          ) : (
                            <span>Basic themes available. Login for premium themes.</span>
                          )}
                        </div>
                      </div>
                    </div>

                  <DropdownMenuSeparator />
                  
                  <div className="flex items-center justify-between pt-4">
                    <Label htmlFor="notifications" className="text-sm">
                      {t('settings.notifications')}
                    </Label>
                    <Switch id="notifications" defaultChecked />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
