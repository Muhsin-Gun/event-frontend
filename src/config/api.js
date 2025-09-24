// src/config/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_BASE;

// API endpoints configuration
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE}/api/auth/login`,
    REGISTER: `${API_BASE}/api/auth/register`,
    REFRESH_TOKEN: `${API_BASE}/api/auth/refresh-token`,
    FORGOT_PASSWORD: `${API_BASE}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/api/auth/reset-password`
  },
  
  // Events
  EVENTS: {
    GET_ALL: `${API_BASE}/api/events`,
    GET_BY_ID: (id) => `${API_BASE}/api/events/${id}`,
    CREATE: `${API_BASE}/api/events`,
    UPDATE: (id) => `${API_BASE}/api/events/${id}`,
    DELETE: (id) => `${API_BASE}/api/events/${id}`
  },
  
  // Users
  USERS: {
    GET_ALL: `${API_BASE}/api/users/getUsers`,
    GET_BY_ID: (id) => `${API_BASE}/api/users/getUser/${id}`,
    UPDATE: (id) => `${API_BASE}/api/users/updateUser/${id}`,
    DELETE: (id) => `${API_BASE}/api/users/deleteUser/${id}`
  },
  
  // Payments
  PAYMENTS: {
    STK_PUSH: `${API_BASE}/api/payments/mpesa/stkpush`,
    CALLBACK: `${API_BASE}/api/payments/mpesa/callback`,
    STATS: `${API_BASE}/api/payments/stats`
  },
  
  // Reports
  REPORTS: {
    SALES: `${API_BASE}/api/reports/sales`
  }
};

// HTTP helper functions
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json().catch(() => null);
    
    return {
      success: response.ok,
      status: response.status,
      data,
      message: data?.message || data?.error || (response.ok ? 'Success' : 'Request failed')
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      data: null,
      message: error.message || 'Network error'
    };
  }
};

// Specific API functions
export const authAPI = {
  login: (credentials) => apiRequest(ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  register: (userData) => apiRequest(ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  forgotPassword: (email) => apiRequest(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  
  resetPassword: (token, newPassword) => apiRequest(ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  })
};

export const eventsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.EVENTS.GET_ALL}${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(ENDPOINTS.EVENTS.GET_BY_ID(id)),
  
  create: (eventData) => apiRequest(ENDPOINTS.EVENTS.CREATE, {
    method: 'POST',
    body: JSON.stringify(eventData)
  }),
  
  update: (id, eventData) => apiRequest(ENDPOINTS.EVENTS.UPDATE(id), {
    method: 'PATCH',
    body: JSON.stringify(eventData)
  }),
  
  delete: (id) => apiRequest(ENDPOINTS.EVENTS.DELETE(id), {
    method: 'DELETE'
  })
};

export const usersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.USERS.GET_ALL}${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(ENDPOINTS.USERS.GET_BY_ID(id)),
  
  update: (id, userData) => apiRequest(ENDPOINTS.USERS.UPDATE(id), {
    method: 'PATCH',
    body: JSON.stringify(userData)
  }),
  
  delete: (id) => apiRequest(ENDPOINTS.USERS.DELETE(id), {
    method: 'DELETE'
  })
};

export const paymentsAPI = {
  stkPush: (paymentData) => apiRequest(ENDPOINTS.PAYMENTS.STK_PUSH, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),
  
  getStats: () => apiRequest(ENDPOINTS.PAYMENTS.STATS)
};

export const reportsAPI = {
  getSales: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`${ENDPOINTS.REPORTS.SALES}${queryString ? `?${queryString}` : ''}`);
  }
};