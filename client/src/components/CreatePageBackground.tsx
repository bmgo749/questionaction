import { useAuth } from '@/hooks/useAuth';

interface CreatePageBackgroundProps {
  children: React.ReactNode;
}

export function CreatePageBackground({ children }: CreatePageBackgroundProps) {
  const { user } = useAuth();
  const selectedTheme = user?.selectedTheme || 'dark';

  // Generate theme-specific background and styling
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

  const isPremiumTheme = selectedTheme && ['topaz', 'agate', 'aqua'].includes(selectedTheme);
  const isBasicTheme = selectedTheme && ['dark', 'light'].includes(selectedTheme);

  // 25% of home page stars: 95 -> 24, 30 -> 8, 17 -> 4
  const smallStars = 24;
  const mediumStars = 8;
  const largeStars = 4;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Theme Background Effects for Left and Right Sides Only */}
      {isPremiumTheme && (
        <>
          {/* Left side background */}
          <div 
            className="fixed left-0 top-0 w-1/3 h-full pointer-events-none z-0"
            style={{ background: getThemeGradient(selectedTheme) }}
          >
            {/* Left side stars */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Small stars */}
              {[...Array(smallStars)].map((_, i) => (
                <div
                  key={`left-small-${i}`}
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
              {[...Array(mediumStars)].map((_, i) => (
                <div
                  key={`left-medium-${i}`}
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
              {[...Array(largeStars)].map((_, i) => (
                <div
                  key={`left-large-${i}`}
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
          </div>

          {/* Right side background */}
          <div 
            className="fixed right-0 top-0 w-1/3 h-full pointer-events-none z-0"
            style={{ background: getThemeGradient(selectedTheme) }}
          >
            {/* Right side stars */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Small stars */}
              {[...Array(smallStars)].map((_, i) => (
                <div
                  key={`right-small-${i}`}
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
              {[...Array(mediumStars)].map((_, i) => (
                <div
                  key={`right-medium-${i}`}
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
              {[...Array(largeStars)].map((_, i) => (
                <div
                  key={`right-large-${i}`}
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
          </div>

          {/* Theme-specific Crystal Elements (25% reduced) */}
          {selectedTheme === 'topaz' && (
            <>
              {/* Left side crystals */}
              <div className="fixed left-0 top-0 w-1/3 h-full pointer-events-none z-0">
                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 transform rotate-45 opacity-35 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-300 transform -rotate-12 opacity-30 animate-pulse"></div>
              </div>
              {/* Right side crystals */}
              <div className="fixed right-0 top-0 w-1/3 h-full pointer-events-none z-0">
                <div className="absolute top-4 right-4 w-9 h-9 bg-gradient-to-br from-orange-300 to-yellow-400 transform rotate-12 opacity-45 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-300 transform rotate-45 opacity-40 animate-pulse"></div>
              </div>
            </>
          )}

          {selectedTheme === 'agate' && (
            <>
              {/* Left side crystals */}
              <div className="fixed left-0 top-0 w-1/3 h-full pointer-events-none z-0">
                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-500 transform rotate-45 opacity-32 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-300 transform -rotate-12 opacity-27 animate-pulse"></div>
              </div>
              {/* Right side crystals */}
              <div className="fixed right-0 top-0 w-1/3 h-full pointer-events-none z-0">
                <div className="absolute top-4 right-4 w-9 h-9 bg-gradient-to-br from-gray-300 to-gray-400 transform rotate-12 opacity-42 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-200 transform rotate-45 opacity-37 animate-pulse"></div>
              </div>
            </>
          )}

          {selectedTheme === 'aqua' && (
            <>
              {/* Left side crystals */}
              <div className="fixed left-0 top-0 w-1/3 h-full pointer-events-none z-0">
                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full opacity-31 animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-300 rounded-full opacity-26 animate-pulse"></div>
              </div>
              {/* Right side crystals */}
              <div className="fixed right-0 top-0 w-1/3 h-full pointer-events-none z-0">
                <div className="absolute top-4 right-4 w-9 h-9 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-41 animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-300 rounded-full opacity-36 animate-pulse"></div>
              </div>
            </>
          )}
        </>
      )}

      {/* Content Layer */}
      <div className={`relative z-10 ${
        isPremiumTheme ? 'bg-white dark:bg-black' : 'bg-white dark:bg-black'
      }`}>
        {children}
      </div>
    </div>
  );
}