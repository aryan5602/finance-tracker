import client from './client';

export const transactionsApi = {
  list: (params) => client.get('/transactions', { params }).then((r) => r.data),
  create: (data) => client.post('/transactions', data).then((r) => r.data),
  update: (id, data) => client.put(`/transactions/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/transactions/${id}`),
};
