import axios from 'axios';

// Base API URL (your backend)
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ============================================
// AUTH API

export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
};

// ============================================
// PROPERTIES API

export const propertiesAPI = {
    getAll: () => api.get('/properties'),
    getById: (id) => api.get(`/properties/${id}`),
    create: (data) => api.post('/properties', data),
    update: (id, data) => api.put(`/properties/${id}`, data),
    delete: (id) => api.delete(`/properties/${id}`),
};

// ============================================
// UNITS API

export const unitsAPI = {
    getAll: (propertyId) => api.get('/units', { params: { property_id: propertyId } }),
    getById: (id) => api.get(`/units/${id}`),
    create: (data) => api.post('/units', data),
    update: (id, data) => api.put(`/units/${id}`, data),
    delete: (id) => api.delete(`/units/${id}`),
};

// ============================================
// TENANTS API

export const tenantsAPI = {
    getAll: () => api.get('/tenants'),
    getById: (id) => api.get(`/tenants/${id}`),
    create: (data) => api.post('/tenants', data),
    update: (id, data) => api.put(`/tenants/${id}`, data),
    delete: (id) => api.delete(`/tenants/${id}`),
};

// ============================================
// LEASES API

export const leasesAPI = {
    getAll: () => api.get('/leases'),
    getById: (id) => api.get(`/leases/${id}`),
    getActive: () => api.get('/leases/active'),
    getExpiring: (days = 30) => api.get(`/leases/expiring?days=${days}`),
    getVacantUnits: () => api.get('/leases/vacant-units'),
    create: (data) => api.post('/leases', data),
    update: (id, data) => api.put(`/leases/${id}`, data),
    delete: (id) => api.delete(`/leases/${id}`),
};

export default api;