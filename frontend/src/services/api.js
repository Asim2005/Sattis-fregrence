import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('satish_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('satish_token');
      localStorage.removeItem('satish_user');
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Products ─────────────────────────────────────────────
export const productsAPI = {
  getAll:  (params) => api.get('/products', { params }),
  getOne:  (id)     => api.get(`/products/${id}`),
  create:  (data)   => api.post('/products', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  destroy: (id)     => api.delete(`/products/${id}`),
};

// ── Categories ───────────────────────────────────────────
export const categoriesAPI = {
  getAll:  ()       => api.get('/categories'),
  create:  (data)   => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  destroy: (id)     => api.delete(`/categories/${id}`),
};

// ── Orders ───────────────────────────────────────────────
export const ordersAPI = {
  getAll:  (params) => api.get('/orders', { params }),
  getOne:  (id)     => api.get(`/orders/${id}`),
  create:  (data)   => api.post('/orders', data),
  update:  (id, data) => api.put(`/orders/${id}`, data),
  notifyStatus: (id)  => api.post(`/orders/${id}/notify-status`),
  destroy: (id)     => api.delete(`/orders/${id}`),
};

// ── Reviews ──────────────────────────────────────────────
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/reviews/${productId}`),
  getAllAdmin:  ()           => api.get('/reviews/admin/all'),
  create:  (data)   => api.post('/reviews', data),
  update:  (id, data) => api.put(`/reviews/${id}`, data),
  destroy: (id)     => api.delete(`/reviews/${id}`),
};

// ── Hero Carousel ────────────────────────────────────────
export const heroAPI = {
  getAll:  ()       => api.get('/hero'),
  create:  (data)   => api.post('/hero', data),
  update:  (id, data) => api.put(`/hero/${id}`, data),
  destroy: (id)     => api.delete(`/hero/${id}`),
};

// ── Settings ─────────────────────────────────────────────
export const settingsAPI = {
  getAll:  ()     => api.get('/settings'),
  update:  (data) => api.post('/settings', data),
};

// ── Analytics ────────────────────────────────────────────
export const analyticsAPI = {
  get: () => api.get('/analytics'),
};

// ── Coupons ──────────────────────────────────────────────
export const couponsAPI = {
  getAll:   ()           => api.get('/coupons'),
  validate: (code)       => api.get(`/coupons/validate/${code}`),
  create:   (data)       => api.post('/coupons', data),
  update:   (id, data)   => api.put(`/coupons/${id}`, data),
  destroy:  (id)         => api.delete(`/coupons/${id}`),
};

// ── Newsletter ───────────────────────────────────────────
export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter', { email }),
  getSubscribers: () => api.get('/newsletter'),
  sendCampaign: (data) => api.post('/newsletter/send-campaign', data),
};

// ── Discover Boxes ───────────────────────────────────────
export const discoverAPI = {
  getAll: () => api.get('/discover-boxes'),
  update: (id, data) => api.put(`/discover-boxes/${id}`, data),
};


// ── Upload ───────────────────────────────────────────────
export const uploadAPI = {
  upload: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ── Contact ──────────────────────────────────────────────
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

export default api;
