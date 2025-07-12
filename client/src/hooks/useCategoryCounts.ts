import { useQuery } from '@tanstack/react-query';

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['/api/categories/counts'],
    queryFn: async () => {
      const response = await fetch('/api/categories/counts');
      if (!response.ok) {
        throw new Error('Failed to fetch category counts');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}