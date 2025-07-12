import { useQuery } from '@tanstack/react-query';

interface IQStatus {
  iqTestTaken: boolean;
  iqScore?: number;
  testDate?: string;
}

export function useIQStatus() {
  return useQuery<IQStatus>({
    queryKey: ['/api/iq/status'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}