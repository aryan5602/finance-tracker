import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoriesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
