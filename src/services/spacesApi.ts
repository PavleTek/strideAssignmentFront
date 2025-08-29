import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Space {
  id: string;
  name: string;
  level: number;
  children?: Space[];
}

export interface SpacesResponse {
  spaces: Space[];
}

export interface SpaceDetailsResponse {
  space: any; // Using any for now to avoid complex interface
}

export const spacesApi = {
  async getSpaces(): Promise<SpacesResponse> {
    const response = await api.get<SpacesResponse>('/spaces/titles');
    return response.data;
  },

  async getSubscribedSpaces(): Promise<SpacesResponse> {
    const response = await api.get<SpacesResponse>('/spaces/subscribed');
    return response.data;
  },

  async getSubscribedSpacesHierarchy(): Promise<SpacesResponse> {
    const response = await api.get<SpacesResponse>('/spaces/subscribed-hierarchy');
    return response.data;
  },

  async getAllSpaces(): Promise<SpacesResponse> {
    const response = await api.get<SpacesResponse>('/spaces/all');
    return response.data;
  },

  async toggleSubscription(spaceId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/spaces/subscribe', {
      spaceId,
    });
    return response.data;
  },



  async getSpaceById(spaceId: string): Promise<SpaceDetailsResponse> {
    const response = await api.get<SpaceDetailsResponse>(`/spaces/${spaceId}`);
    return response.data;
  },
};

// Export a convenience function for the context
export const getSpaces = () => spacesApi.getSpaces();

// Export convenience function for subscribed spaces hierarchy
export const getSubscribedSpacesHierarchy = () => spacesApi.getSubscribedSpacesHierarchy();
