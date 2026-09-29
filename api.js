import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hirerecall_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  demoLogin: () => api.post('/auth/demo-login'),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (prefs) => api.put('/auth/preferences', prefs)
};

// Candidate APIs
export const candidateApi = {
  list: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  uploadResume: (data) => api.post('/candidates/upload-resume', data),
  getInterviews: (id) => api.get(`/candidates/${id}/interviews`),
  addInterview: (id, data) => api.post(`/candidates/${id}/interviews`, data),
  getMemories: (id) => api.get(`/candidates/${id}/memory`),
  recallMemory: (id, query) => api.post(`/candidates/${id}/memory/recall`, { query }),
  getEvolution: (id) => api.get(`/candidates/${id}/evolution`)
};

// Hindsight Memory APIs
export const memoryApi = {
  getMetrics: () => api.get('/memory/metrics'),
  getAll: (params) => api.get('/memory/all', { params }),
  getHindsightHealth: () => api.get('/health/hindsight')
};

// AI Intelligence APIs
export const aiApi = {
  prepareNextInterview: (candidateId, notes) => api.post('/ai/prepare-interview', { candidateId, notes }),
  chat: (candidateId, question) => api.post('/ai/chat', { candidateId, question }),
  getBeforeAfter: (candidateId) => api.get(`/ai/before-after/${candidateId}`)
};

// Job Roles APIs
export const roleApi = {
  list: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data)
};

// Demo Seed APIs
export const seedApi = {
  resetData: () => api.post('/seed/reset')
};

export default api;
