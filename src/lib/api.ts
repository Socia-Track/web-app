// API utility for making authenticated requests to the backend
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Log environment configuration
console.log(`🌍 Frontend Environment: ${import.meta.env.VITE_NODE_ENV || 'development'}`);
console.log(`🔗 API Base URL: ${API_URL}`);
console.log(`🎯 Backend URL: ${BACKEND_URL}`);

export const api = {
  // Get authorization header with bearer token
  getAuthHeaders: () => {
    const token = localStorage.getItem('bearer_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  },

  // Make authenticated GET request
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: api.getAuthHeaders(),
    });
    return response;
  },

  // Make authenticated POST request
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: api.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response;
  },

  // Make authenticated PUT request
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: api.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response;
  },

  // Make authenticated DELETE request
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: api.getAuthHeaders(),
    });
    return response;
  },
};

// Export API_URL and BACKEND_URL for direct use
export { API_URL, BACKEND_URL };
