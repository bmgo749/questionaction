import { useState } from 'react';
import { Menu, X, LogIn, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { categories } from '@/data/categories';

const iconMap: Record<string, string> = {
  globe: '🌍',
  history: '📚',
  flask: '🧪',
  map: '🗺️',
  running: '🏃',
  film: '🎬',
  landmark: '🏛️',
  microchip: '💻',
  heartbeat: '❤️',
  'graduation-cap': '🎓',
};

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
          <Link
            href="/auth"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <LogIn className="mr-3 h-5 w-5" />
              <span>Login</span>
            </div>
          </Link>

          {/* Create Article Button */}
          <Link
            href="/create-article"
            onClick={() => setOpen(false)}
          >
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <Lightbulb className="mr-3 h-5 w-5" />
              <span>Creativity Creation</span>
            </div>
          </Link>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Navigation Items */}
          <Link href="/" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span className="mr-3 text-lg">🏠</span>
              <span>Home</span>
            </div>
          </Link>
          
          <Link href="/categories" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span className="mr-3 text-lg">📁</span>
              <span>Category</span>
            </div>
          </Link>
          
          <Link href="/trending" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span className="mr-3 text-lg">🔥</span>
              <span>Trending</span>
            </div>
          </Link>
          
          <Link href="/question" onClick={() => setOpen(false)}>
            <div className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              <span className="mr-3 text-lg">❓</span>
              <span>Question</span>
            </div>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
