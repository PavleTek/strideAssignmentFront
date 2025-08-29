import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', {
      usernameOrEmail,
      password,
    });
    return response.data;
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  async logout(token: string): Promise<void> {
    await api.post('/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async getProfile(token: string): Promise<User> {
    const response = await api.get<{ user: User }>('/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  },
};
