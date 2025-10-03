import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      axios.post('/auth/login', { email, password }),
    me: () => 
      axios.get('/auth/me'),
  },

  // Contacts endpoints
  contacts: {
    getAll: (params?: any) => 
      axios.get('/contacts', { params }),
    getById: (id: string) => 
      axios.get(`/contacts/${id}`),
    create: (data: any) => 
      axios.post('/contacts', data),
    update: (id: string, data: any) => 
      axios.put(`/contacts/${id}`, data),
    delete: (id: string) => 
      axios.delete(`/contacts/${id}`),
  },

  // Deals endpoints
  deals: {
    getAll: (params?: any) => 
      axios.get('/deals', { params }),
    getById: (id: string) => 
      axios.get(`/deals/${id}`),
    create: (data: any) => 
      axios.post('/deals', data),
    update: (id: string, data: any) => 
      axios.put(`/deals/${id}`, data),
    delete: (id: string) => 
      axios.delete(`/deals/${id}`),
  },

  // Appointments endpoints
  appointments: {
    getAll: (params?: any) => 
      axios.get('/appointments', { params }),
    getById: (id: string) => 
      axios.get(`/appointments/${id}`),
    create: (data: any) => 
      axios.post('/appointments', data),
    update: (id: string, data: any) => 
      axios.put(`/appointments/${id}`, data),
    delete: (id: string) => 
      axios.delete(`/appointments/${id}`),
  },

  // Analytics endpoints
  analytics: {
    getDashboard: () => 
      axios.get('/analytics/dashboard'),
    getReports: (params?: any) => 
      axios.get('/analytics/reports', { params }),
  },

  // Properties endpoints (Real Estate)
  properties: {
    getAll: (params?: any) => 
      axios.get('/properties', { params }),
    getById: (id: string) => 
      axios.get(`/properties/${id}`),
    create: (data: any) => 
      axios.post('/properties', data),
    update: (id: string, data: any) => 
      axios.put(`/properties/${id}`, data),
    delete: (id: string) => 
      axios.delete(`/properties/${id}`),
  },

  // Patients endpoints (Dental)
  patients: {
    getAll: (params?: any) => 
      axios.get('/patients', { params }),
    getById: (id: string) => 
      axios.get(`/patients/${id}`),
    create: (data: any) => 
      axios.post('/patients', data),
    update: (id: string, data: any) => 
      axios.put(`/patients/${id}`, data),
    delete: (id: string) => 
      axios.delete(`/patients/${id}`),
  },
};

export default api;