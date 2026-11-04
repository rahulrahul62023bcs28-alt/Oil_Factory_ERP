import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://smartoil-erp-backend.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Attach Authorization JWT Token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartoil_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401/403 expired token, clear storage
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Clearing local token.');
      localStorage.removeItem('smartoil_jwt');
      localStorage.removeItem('smartoil_user');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (identifier, password) => apiClient.post('/auth/login', { identifier, password }),
  googleAuth: (credentialData) => apiClient.post('/auth/google', credentialData),
  getMe: () => apiClient.get('/auth/me'),
  getAccountsPool: () => apiClient.get('/auth/accounts-pool'),
  registerCredentials: (accountData) => apiClient.post('/auth/register-credentials', accountData),
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
};

// Inventory Services
export const inventoryService = {
  getInventory: () => apiClient.get('/inventory'),
  updateItem: (id, data) => apiClient.put(`/inventory/${id}`, data),
};

// Production Services
export const productionService = {
  getLogs: () => apiClient.get('/production'),
  addBatch: (data) => apiClient.post('/production', data),
};

// Sales Services
export const salesService = {
  getLogs: () => apiClient.get('/sales'),
  addSale: (data) => apiClient.post('/sales', data),
};

// Supplier Services
export const supplierService = {
  getLogs: () => apiClient.get('/suppliers'),
  addIntake: (data) => apiClient.post('/suppliers', data),
};

// Employee Services
export const employeeService = {
  getEmployees: () => apiClient.get('/employees'),
  addEmployee: (data) => apiClient.post('/employees', data),
  removeEmployee: (id) => apiClient.delete(`/employees/${id}`),
  updateAttendance: (id, attendance) => apiClient.patch(`/employees/${id}/attendance`, { attendance }),
};

// Analytics Services
export const analyticsService = {
  getSummary: () => apiClient.get('/analytics/summary'),
  getAIInsights: () => apiClient.get('/analytics/ai-insights'),
  simulateScenario: (data) => apiClient.post('/analytics/simulate', data),
  predictYield: (data) => apiClient.post('/analytics/predict-yield', data),
  getFlowAndEarningsForecast: (params) => apiClient.get('/analytics/flow-earnings-forecast', { params }),
  getProductionPrediction: (planned) => apiClient.get('/analytics/production-prediction', { params: { planned } }),
};

export default apiClient;
