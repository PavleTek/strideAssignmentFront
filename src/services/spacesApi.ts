import axios from 'axios';
import Cookies from 'js-cookie';
import { getApiUrl } from '../config/api';

const API_BASE_URL = getApiUrl('');

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
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, remove it and redirect to login
      Cookies.remove('token');
      // Dispatch a custom event to notify the app about auth failure
      window.dispatchEvent(new CustomEvent('auth-failed'));
    }
    return Promise.reject(error);
  }
);

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
  space: SpaceDetails;
}

export interface SpaceDetails {
  id: string;
  name: string;
  about?: string;
  level: number;
  children?: SpaceDetails[];
  bannerURL?: string;
  contributors?: Array<{ user: { id: string; username: string } }>;
  flashcards?: Array<FlashcardData>;
  articles?: Array<ArticleData>;
  alerts?: Array<AlertData>;
  subscribers?: Array<{ user: { id: string; username: string } }>;
}

export interface FlashcardData {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  comments?: Array<CommentData>;
  reactions?: Array<ReactionData>;
}

export interface ArticleData {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  comments?: Array<CommentData>;
  reactions?: Array<ReactionData>;
}

export interface AlertData {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  space: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    username: string;
  };
  author: {
    id: string;
    username: string;
  };
  comments?: Array<CommentData>;
  reactions?: Array<ReactionData>;
}

export interface CommentData {
  id: string;
  text: string;
  level: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  replies?: Array<CommentData>;
  reactions?: Array<ReactionData>;
}

export interface ReactionData {
  id: string;
  emoji: string;
  user: {
    id: string;
    username: string;
  };
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
  }): Promise<{ reaction: ReactionData }> {
    const response = await api.post<{ reaction: ReactionData }>('/content/reactions', data);
    return response.data;
  },

  async createComment(data: {
    text: string;
    parentId?: string;
    articleId?: string;
    flashcardId?: string;
  }): Promise<{ comment: CommentData }> {
    const response = await api.post<{ comment: CommentData }>('/content/comments', data);
    return response.data;
  },
};

// Export a convenience function for the context
export const getSpaces = () => spacesApi.getSpaces();

// Export convenience function for subscribed spaces hierarchy
export const getSubscribedSpacesHierarchy = () => spacesApi.getSubscribedSpacesHierarchy();
