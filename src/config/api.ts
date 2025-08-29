// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  AUTH_ENDPOINT: '/auth',
  SPACES_ENDPOINT: '/spaces',
  CONTENT_ENDPOINT: '/content',
} as const;

// Helper function to get full API URL for a specific endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth API URL
export const getAuthApiUrl = (): string => {
  return getApiUrl(API_CONFIG.AUTH_ENDPOINT);
};

// Helper function to get spaces API URL
export const getSpacesApiUrl = (): string => {
  return getApiUrl(API_CONFIG.SPACES_ENDPOINT);
};

// Helper function to get content API URL
export const getContentApiUrl = (): string => {
  return getApiUrl(API_CONFIG.CONTENT_ENDPOINT);
};
