import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share, ChevronLeft, ChevronRight } from 'lucide-react';
import { PagePost } from '@/../../shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';

export function NSFWPagePostsFeed() {
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();
  const POSTS_PER_PAGE = 10;

  // Fetch all page posts and filter for NSFW
  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ['/api/page-posts'],
    queryFn: async () => {
      const response = await fetch('/api/page-posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json() as PagePost[];
    },
  });

  // Filter only NSFW posts
  const nsfwPosts = allPosts.filter(post => post.isNsfw);
  
  // Pagination logic
  const totalPosts = nsfwPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = nsfwPosts.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p>Loading NSFW content...</p>
      </div>
    );
  }

  if (nsfwPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            No NSFW Content Available
          </h3>
          <p className="text-red-700 dark:text-red-400 text-sm">
            There are currently no NSFW posts to display. Check back later or create some content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NSFW Posts Feed */}
      <div className="space-y-4">
        {paginatedPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-red-200 dark:border-red-800">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {post.authorName || `Anonymous ${post.authorIp?.slice(-4) || 'User'}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* NSFW Badge */}
              <div className="flex space-x-2">
                <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs font-semibold px-2 py-1 rounded">
                  🔞 NSFW
                </span>
                <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs font-semibold px-2 py-1 rounded">
                  {post.type}
                </span>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {post.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {post.content}
              </p>
            </div>

            {/* Media Content */}
            {post.mediaUrl && (
              <div className="mb-4">
                {post.type === 'photo' && (
                  <img 
                    src={post.mediaUrl} 
                    alt={post.title}
                    className="rounded-lg max-h-96 w-full object-cover"
                  />
                )}
                {post.type === 'video' && (
                  <video 
                    src={post.mediaUrl} 
                    controls 
                    className="rounded-lg max-h-96 w-full"
                  />
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                {/* Likes Disabled for NSFW */}
                <div className="flex items-center space-x-2 text-gray-400">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Likes Disabled</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments || 0}</span>
                </div>
              </div>
              
              <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                <Share className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <span className="text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages} ({totalPosts} NSFW posts)
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}