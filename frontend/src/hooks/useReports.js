import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export function useSummary(params) {
  return useQuery({
    queryKey: ['reports', 'summary', params],
    queryFn: () => reportsApi.summary(params),
  });
}

export function useByCategory(params) {
  return useQuery({
    queryKey: ['reports', 'by-category', params],
    queryFn: () => reportsApi.byCategory(params),
  });
}
