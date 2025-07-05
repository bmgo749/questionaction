import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Sidebar } from '@/components/Sidebar';
import { WelcomeSection } from '@/components/WelcomeSection';
import { CategoryGrid } from '@/components/CategoryGrid';
import { RecentUpdates } from '@/components/RecentUpdates';
import { SearchResults } from '@/components/SearchResults';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearchMode(true);
  };

  const handleBackToHome = () => {
    setSearchTerm('');
    setIsSearchMode(false);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:flex lg:space-x-8">
          <Sidebar />
          
          <div className="lg:flex-1">
            <WelcomeSection onSearch={handleSearch} />
            {isSearchMode ? (
              <SearchResults 
                searchTerm={searchTerm} 
                onBack={handleBackToHome} 
              />
            ) : (
              <>
                <CategoryGrid />
                <RecentUpdates />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
