import { useState } from 'react';
import { Menu, X, LogIn, Lightbulb, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SecureLink } from '@/components/SecureRouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/categories';



export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          {/* Login Button */}
          <SecureLink
            href="/auth"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <LogIn className="mr-3 h-5 w-5" />
              <span>Login</span>
            </div>
          </SecureLink>

          {/* Create Article Button */}
          <SecureLink
            href="/create-article"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
              <Lightbulb className="mr-3 h-5 w-5" />
              <span>Create</span>
            </div>
          </SecureLink>

          {/* Settings Button */}
          <SecureLink
            href="/settings"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </div>
          </SecureLink>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Navigation Items */}
          <SecureLink href="/" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span>Home</span>
            </div>
          </SecureLink>
          
          <SecureLink href="/categories" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span>Category</span>
            </div>
          </SecureLink>
          
          <SecureLink href="/trending" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span>Trending</span>
            </div>
          </SecureLink>
          
          <SecureLink href="/market" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span>Market</span>
            </div>
          </SecureLink>
          
          <SecureLink href="/question" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span>Help</span>
            </div>
          </SecureLink>
          
          <SecureLink href="/page" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span>Page</span>
            </div>
          </SecureLink>
          
          <SecureLink href="/guilds" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Users className="mr-3 h-5 w-5" />
              <span>Guilds</span>
            </div>
          </SecureLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
