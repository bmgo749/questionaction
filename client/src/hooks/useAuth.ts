import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 30 * 1000, // 30 seconds cache for auth stability
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    refetchOnMount: true, // Refetch on mount to ensure proper login state
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on reconnect for proper auth state
    refetchInterval: false, // Disable auto refetch
    refetchIntervalInBackground: false, // Disable background refetch
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
  };
}