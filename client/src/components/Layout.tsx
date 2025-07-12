import { Header } from './Header';
import { Footer } from './Footer';
import { CookieConsent } from './CookieConsent';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const selectedTheme = user?.selectedTheme || 'dark';

  // Generate theme-specific background and styling
  const getThemeBackground = (theme: string) => {
    switch (theme) {
      case 'topaz':
        return 'bg-black';
      case 'agate':
        return 'bg-black';
      case 'aqua':
        return 'bg-black';
      default:
        return 'bg-white dark:bg-black';
    }
  };

  // Theme-specific gradient overlays
  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'topaz':
        return 'linear-gradient(135deg, rgba(255, 165, 0, 0.20) 0%, rgba(255, 215, 0, 0.20) 50%, rgba(255, 193, 7, 0.20) 100%)';
      case 'agate':
        return 'linear-gradient(135deg, rgba(128, 128, 128, 0.18) 0%, rgba(169, 169, 169, 0.18) 40%, rgba(192, 192, 192, 0.18) 70%, rgba(248, 248, 255, 0.18) 100%)';
      case 'aqua':
        return 'linear-gradient(135deg, rgba(25, 25, 112, 0.20) 0%, rgba(0, 100, 150, 0.20) 30%, rgba(70, 130, 180, 0.20) 60%, rgba(135, 206, 235, 0.20) 100%)';
      default:
        return 'transparent';
    }
  };

  const getStarColor = (theme: string) => {
    switch (theme) {
      case 'topaz':
        return 'bg-orange-200';
      case 'agate':
        return 'bg-gray-200';
      case 'aqua':
        return 'bg-cyan-200';
      default:
        return 'bg-white';
    }
  };

  const getCrystalColor = (theme: string) => {
    switch (theme) {
      case 'topaz':
        return 'fill-yellow-400/40 stroke-yellow-500';
      case 'agate':
        return 'fill-gray-400/40 stroke-gray-500';
      case 'aqua':
        return 'fill-cyan-400/40 stroke-cyan-500';
      default:
        return 'fill-white/20 stroke-white/40';
    }
  };

  const isPremiumTheme = selectedTheme && ['topaz', 'agate', 'aqua'].includes(selectedTheme);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className={`relative min-h-screen overflow-hidden ${getThemeBackground(selectedTheme)} ${isPremiumTheme ? 'text-white' : 'text-gray-900 dark:text-white'} transition-colors duration-300`}>
        
        {/* Theme Gradient Overlay */}
        {isPremiumTheme && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ background: getThemeGradient(selectedTheme) }}
          />
        )}
        
        {/* Premium Theme Background Effects */}
        {isPremiumTheme && (
          <>
            {/* Animated Stars for Premium Themes */}
            <div className="absolute inset-0 pointer-events-none">
            {/* Small stars */}
            {[...Array(95)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full opacity-80 animate-pulse ${getStarColor(selectedTheme)}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
            {/* Medium stars */}
            {[...Array(30)].map((_, i) => (
              <div
                key={`medium-${i}`}
                className={`absolute w-2 h-2 rounded-full opacity-70 animate-pulse ${getStarColor(selectedTheme)}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
            {/* Large stars */}
            {[...Array(17)].map((_, i) => (
              <div
                key={`large-${i}`}
                className={`absolute w-3 h-3 rounded-full opacity-60 animate-pulse ${getStarColor(selectedTheme)}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          {/* Theme-specific Crystal Elements */}
          {selectedTheme === 'topaz' && (
            <>
              {/* Topaz Crystals - Golden geometric shapes */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-45 opacity-35 animate-pulse"></div>
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-orange-300 to-yellow-400 transform rotate-12 opacity-45 animate-pulse"></div>
              <div className="absolute top-20 left-20 w-10 h-10 bg-gradient-to-br from-yellow-200 to-orange-300 transform rotate-45 opacity-40 animate-pulse"></div>
              <div className="absolute top-40 right-10 w-14 h-14 bg-gradient-to-br from-orange-400 to-yellow-300 transform -rotate-12 opacity-30 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-300 transform -rotate-12 opacity-30 animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-13 h-13 bg-gradient-to-br from-orange-400 to-yellow-300 transform rotate-45 opacity-40 animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-11 h-11 bg-gradient-to-br from-yellow-300 to-orange-200 transform rotate-12 opacity-35 animate-pulse"></div>
              <div className="absolute bottom-40 right-10 w-15 h-15 bg-gradient-to-br from-orange-300 to-yellow-400 transform rotate-45 opacity-45 animate-pulse"></div>
              {/* Additional bottom crystals */}
              <div className="absolute bottom-0 right-20 w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-45 opacity-30 animate-pulse"></div>
              <div className="absolute bottom-0 left-32 w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-300 transform rotate-12 opacity-35 animate-pulse"></div>
            </>
          )}

          {selectedTheme === 'agate' && (
            <>
              {/* Agate Crystals - Silver diamond shapes */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-500 transform rotate-45 opacity-32 animate-pulse"></div>
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 transform rotate-12 opacity-42 animate-pulse"></div>
              <div className="absolute top-20 left-20 w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-400 transform rotate-45 opacity-37 animate-pulse"></div>
              <div className="absolute top-40 right-10 w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-300 transform -rotate-12 opacity-27 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-300 transform -rotate-12 opacity-27 animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-13 h-13 bg-gradient-to-br from-gray-500 to-gray-200 transform rotate-45 opacity-37 animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-11 h-11 bg-gradient-to-br from-gray-300 to-gray-500 transform rotate-12 opacity-32 animate-pulse"></div>
              <div className="absolute bottom-40 right-10 w-15 h-15 bg-gradient-to-br from-gray-200 to-gray-400 transform rotate-45 opacity-42 animate-pulse"></div>
              {/* Additional bottom crystals */}
              <div className="absolute bottom-0 right-20 w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-400 transform rotate-45 opacity-30 animate-pulse"></div>
              <div className="absolute bottom-0 left-32 w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-200 transform rotate-12 opacity-35 animate-pulse"></div>
            </>
          )}

          {selectedTheme === 'aqua' && (
            <>
              {/* Aqua Crystals - Cyan wave-like shapes */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full opacity-31 animate-pulse"></div>
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-41 animate-pulse"></div>
              <div className="absolute top-20 left-20 w-10 h-10 bg-gradient-to-br from-cyan-200 to-blue-400 rounded-full opacity-36 animate-pulse"></div>
              <div className="absolute top-40 right-10 w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-26 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-300 rounded-full opacity-26 animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-13 h-13 bg-gradient-to-br from-blue-500 to-cyan-300 rounded-full opacity-36 animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-11 h-11 bg-gradient-to-br from-cyan-300 to-blue-200 rounded-full opacity-31 animate-pulse"></div>
              <div className="absolute bottom-40 right-10 w-15 h-15 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-41 animate-pulse"></div>
              {/* Additional bottom crystals */}
              <div className="absolute bottom-0 right-20 w-8 h-8 bg-gradient-to-br from-cyan-300 to-blue-400 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute bottom-0 left-32 w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full opacity-35 animate-pulse"></div>
            </>
          )}
        </>
      )}

        {/* Content Layer */}
        <div className="relative z-10">
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieConsent />
        </div>
      </div>
    </div>
  );
}
