import { Settings, LogOut, User as UserIcon, Crown } from 'lucide-react';
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
import { Link } from 'wouter';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import { MobileMenu } from './MobileMenu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { categories } from '@/data/categories';

export function Header() {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();

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
          <Link href="/">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                {/* Logo tanpa lingkaran, sama besar untuk light dan dark mode */}
                <div className="w-10 h-10 mr-3">
                  <img 
                    src="/attached_assets/Tak berjudul383_20250704194138_1751629685716.png" 
                    alt="QuestionAction logo" 
                    className="w-full h-full object-contain filter invert dark:invert-0"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">QuestionAction</h1>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            <Link href="/">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Home
              </span>
            </Link>
            <Link href="/categories">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Category
              </span>
            </Link>
            <Link href="/trending">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Trending
              </span>
            </Link>
            <Link href="/question">
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors cursor-pointer">
                Question
              </span>
            </Link>
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
                      <div className="flex items-center gap-1 pt-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                          {user.fame || 0} Fame
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Login
                </Button>
              </Link>
            )}

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

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
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">{t('settings.theme')}</Label>
                    <RadioGroup value={theme} onValueChange={setTheme}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light">{t('settings.light')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark">{t('settings.dark')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto">{t('settings.auto')}</Label>
                      </div>
                    </RadioGroup>
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
