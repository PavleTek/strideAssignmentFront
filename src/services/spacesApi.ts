import axios from 'axios';
import Cookies from 'js-cookie';
import { getSpacesApiUrl } from '../config/api';

const API_BASE_URL = getSpacesApiUrl();

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

  // Content API functions
  async createReaction(data: {
    emoji: string;
    articleId?: string;
    flashcardId?: string;
    commentId?: string;
    alertId?: string;
  }): Promise<{ reaction: any }> {
    const response = await api.post<{ reaction: any }>('/content/reactions', data);
    return response.data;
  },

  async createComment(data: {
    text: string;
    parentId?: string;
    articleId?: string;
    flashcardId?: string;
  }): Promise<{ comment: any }> {
    const response = await api.post<{ comment: any }>('/content/comments', data);
    return response.data;
  },
};

// Export a convenience function for the context
export const getSpaces = () => spacesApi.getSpaces();

// Export convenience function for subscribed spaces hierarchy
export const getSubscribedSpacesHierarchy = () => spacesApi.getSubscribedSpacesHierarchy();
