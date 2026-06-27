import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../api/transactions';

export function useTransactions(params) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsApi.list(params),
    keepPreviousData: true,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => transactionsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
