import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Sidebar } from '@/components/Sidebar';
import { WelcomeSection } from '@/components/WelcomeSection';
import { CategoryGrid } from '@/components/CategoryGrid';
import { RecentUpdates } from '@/components/RecentUpdates';
import { SearchResults } from '@/components/SearchResults';
import PagePostsFeed from '@/components/PagePostsFeed';
import { NSFWPagePostsFeed } from '@/components/NSFWPagePostsFeed';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);
  const [nsfwVerified, setNsfwVerified] = useState(false);
  const { language, t } = useLanguage();
  const queryClient = useQueryClient(); // Get queryClient instance

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearchMode(true);
  };

  const handleBackToHome = () => {
    setSearchTerm('');
    setIsSearchMode(false);
  };

  const handleNSFWToggle = () => {
    if (!showNSFW && !nsfwVerified) {
      // Show verification dialog
      if (confirm(t('nsfw.ageVerification')) && confirm(t('nsfw.responsibilityAcknowledgment'))) {
        setNsfwVerified(true);
        setShowNSFW(true);
      }
    } else {
      setShowNSFW(!showNSFW);
    }
  };

  // Auto-refresh data every 60 seconds with visibility check
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const startPolling = () => {
      interval = setInterval(() => {
        // Only refresh if page is visible
        if (!document.hidden) {
          queryClient.invalidateQueries({ queryKey: ['articles'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
        }
      }, 60000); // Increased to 60 seconds
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        startPolling();
      }
    };
    
    // Start polling
    startPolling();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:space-x-8">
          {/* Hide sidebar when NSFW is enabled */}
          {!showNSFW && <Sidebar />}

          <div className="lg:flex-1">


            {!showNSFW && <WelcomeSection onSearch={handleSearch} />}

            {showNSFW ? (
              /* NSFW Mode: Show only NSFW content */
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
                    🔞 NSFW Content Enabled
                  </h2>
                  <p className="text-red-700 dark:text-red-400 text-sm">
                    {t('nsfw.nsfwContentEnabled')}
                  </p>
                </div>
                <NSFWPagePostsFeed />
              </div>
            ) : (
              /* Normal Mode: Show regular content */
              <>
                {isSearchMode ? (
                  <SearchResults 
                    searchTerm={searchTerm} 
                    onBack={handleBackToHome} 
                  />
                ) : (
                  <>
                    <RecentUpdates />
                    <div className="mt-12">
                      <CategoryGrid />
                    </div>
                    <div className="mt-8 mb-8">
                      <PagePostsFeed showNSFW={showNSFW} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}