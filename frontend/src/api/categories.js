import client from './client';

export const categoriesApi = {
  list: () => client.get('/categories').then((r) => r.data),
  create: (data) => client.post('/categories', data).then((r) => r.data),
  update: (id, data) => client.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/categories/${id}`),
};
