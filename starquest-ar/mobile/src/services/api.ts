import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await AsyncStorage.getItem('auth_token');
        }
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async walletLogin(walletAddress: string, signature: string, message: string) {
    try {
      const response = await this.api.post(API_CONFIG.ENDPOINTS.AUTH.WALLET_LOGIN, {
        walletAddress,
        signature,
        message,
      });
      
      if (response.data.success) {
        this.token = response.data.token;
        await AsyncStorage.setItem('auth_token', this.token);
      }
      
      return response.data;
    } catch (error) {
      console.log('API not available, using mock login');
      // Mock successful login for demo
      this.token = 'mock-token-' + Date.now();
      await AsyncStorage.setItem('auth_token', this.token);
      return {
        success: true,
        token: this.token,
        user: {
          id: 'mock-user-id',
          walletAddress: walletAddress,
          username: 'DemoUser',
          level: 1,
          experience: 0,
          starsCollected: 0,
          avatar: null
        }
      };
    }
  }

  async logout() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
  }

  // User methods
  async getUserProfile() {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      console.log('API not available, using mock data');
      return {
        success: false,
        user: null
      };
    }
  }

  async updateUserProfile(data: any) {
    const response = await this.api.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, data);
    return response.data;
  }

  async createUser(userData: any) {
    try {
      const response = await this.api.post('/auth/register', userData);
      
      if (response.data.success) {
        this.token = response.data.token;
        await AsyncStorage.setItem('auth_token', this.token);
      }
      
      return response.data;
    } catch (error) {
      console.log('API not available, using mock user creation');
      // Mock successful user creation for demo
      this.token = 'mock-token-' + Date.now();
      await AsyncStorage.setItem('auth_token', this.token);
      return {
        success: true,
        token: this.token,
        user: {
          id: 'mock-user-' + Date.now(),
          walletAddress: userData.walletAddress,
          username: userData.username,
          stats: userData.stats,
          achievements: userData.achievements,
          avatar: null
        }
      };
    }
  }

  // Quest methods
  async getQuests(params?: any) {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.QUEST.LIST, { params });
      return response.data;
    } catch (error) {
      console.log('API not available, using mock data');
      return {
        success: false,
        quests: []
      };
    }
  }

  async getQuestDetail(id: string) {
    const response = await this.api.get(API_CONFIG.ENDPOINTS.QUEST.DETAIL.replace(':id', id));
    return response.data;
  }

  async joinQuest(id: string) {
    const response = await this.api.post(API_CONFIG.ENDPOINTS.QUEST.JOIN.replace(':id', id));
    return response.data;
  }

  async leaveQuest(id: string) {
    const response = await this.api.post(API_CONFIG.ENDPOINTS.QUEST.LEAVE.replace(':id', id));
    return response.data;
  }

  // Star methods
  async getStars(params?: any) {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.STAR.LIST, { params });
      return response.data;
    } catch (error) {
      console.log('API not available, using mock data');
      return {
        success: false,
        stars: []
      };
    }
  }

  async getStarDetail(id: string) {
    const response = await this.api.get(API_CONFIG.ENDPOINTS.STAR.DETAIL.replace(':id', id));
    return response.data;
  }

  async collectStar(id: string, location?: { latitude: number; longitude: number }) {
    const response = await this.api.post(API_CONFIG.ENDPOINTS.STAR.COLLECT.replace(':id', id), {
      location,
    });
    return response.data;
  }

  async getNearbyStars(location: { latitude: number; longitude: number }, radius: number = 1000) {
    const response = await this.api.get(API_CONFIG.ENDPOINTS.STAR.NEARBY, {
      params: { ...location, radius },
    });
    return response.data;
  }

  // Leaderboard methods
  async getLeaderboard(category: string, params?: any) {
    try {
      let endpoint: string;
      switch (category) {
        case 'stars':
          endpoint = API_CONFIG.ENDPOINTS.LEADERBOARD.STARS;
          break;
        case 'quests':
          endpoint = API_CONFIG.ENDPOINTS.LEADERBOARD.QUESTS;
          break;
        case 'streak':
          endpoint = API_CONFIG.ENDPOINTS.LEADERBOARD.STREAK;
          break;
        case 'experience':
          endpoint = API_CONFIG.ENDPOINTS.LEADERBOARD.EXPERIENCE;
          break;
        default:
          endpoint = `/leaderboard/${category}`;
      }
      
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.log('API not available, using mock data');
      return {
        success: false,
        leaderboard: []
      };
    }
  }

  async getUserPosition(category: string, userId: string) {
    const response = await this.api.get(`/leaderboard/${category}/position/${userId}`);
    return response.data;
  }

  async getLeaderboardStats() {
    const response = await this.api.get('/leaderboard/stats/overview');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

