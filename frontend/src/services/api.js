import axios from 'axios';

/**
 * Centered Axios base client with interceptors for token injection and error handling.
 */
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from sessionStorage
api.interceptors.request.use(
  (config) => {
    let token = sessionStorage.getItem('shift94_token');
    if (!token) {
      const oldToken = sessionStorage.getItem('shift9_token');
      if (oldToken) {
        sessionStorage.setItem('shift94_token', oldToken);
        sessionStorage.removeItem('shift9_token');
        token = oldToken;
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth failures globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // If the server returns a 401 Unauthorized, clear session and redirect
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('shift94_token');
      sessionStorage.removeItem('shift9_token');
      // Only redirect to login if we aren't already on a guest page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Normalize and return the error payload
    const normalizedError = new Error(
      error.response?.data?.message || 'An unexpected error occurred.'
    );
    normalizedError.status = error.response?.status || 500;
    normalizedError.errors = error.response?.data?.errors || null;
    
    return Promise.reject(normalizedError);
  }
);

export default api;
