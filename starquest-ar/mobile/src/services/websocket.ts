import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token?: string) {
    if (this.socket?.connected) {
      return;
    }

    try {
      this.socket = io(API_CONFIG.WS_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        timeout: 5000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.log('WebSocket connection failed, using mock mode');
      // Mock connection for demo
      setTimeout(() => {
        this.emit('connected');
      }, 1000);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    });

    this.socket.on('star-discovered', (data) => {
      console.log('Star discovered:', data);
      this.emit('star-discovered', data);
    });

    this.socket.on('quest-update', (data) => {
      console.log('Quest update:', data);
      this.emit('quest-update', data);
    });

    this.socket.on('leaderboard-update', (data) => {
      console.log('Leaderboard update:', data);
      this.emit('leaderboard-update', data);
    });

    this.socket.on('notification', (data) => {
      console.log('Notification:', data);
      this.emit('notification', data);
    });
  }

  // Join quest room
  joinQuest(questId: string) {
    if (this.socket) {
      this.socket.emit('join-quest', questId);
    }
  }

  // Leave quest room
  leaveQuest(questId: string) {
    if (this.socket) {
      this.socket.emit('leave-quest', questId);
    }
  }

  // Report star found
  reportStarFound(questId: string, userId: string, starId: string) {
    if (this.socket) {
      this.socket.emit('star-found', {
        questId,
        userId,
        starId,
      });
    }
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Connection status
  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
export default websocketService;

