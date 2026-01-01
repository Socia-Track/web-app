// Utility to get the correct API URL for different environments
export function getApiUrl(endpoint: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  
  // In development, use proxy (relative paths)
  if (import.meta.env.DEV) {
    return endpoint;
  }
  
  // In production, use full API URL
  return `${apiUrl}${endpoint}`;
}

// Common API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  ACCESS_REQUESTS: '/api/access-requests',
  USERS_ALL: '/api/users/all',
  USER_LIMITS: (userId: string) => `/api/users/${userId}/limits`,
  ACCESS_REQUEST_APPROVE: (id: string) => `/api/access-requests/${id}/approve`,
  ACCESS_REQUEST_REJECT: (id: string) => `/api/access-requests/${id}/reject`,
} as const;