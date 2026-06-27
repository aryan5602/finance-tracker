import client from './client';

export const reportsApi = {
  summary: (params) => client.get('/reports/summary', { params }).then((r) => r.data),
  byCategory: (params) => client.get('/reports/by-category', { params }).then((r) => r.data),
};
