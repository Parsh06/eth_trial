import { Server } from 'socket.io';

export class NotificationService {
  private io: Server;
  private notifications: Map<string, any[]> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  async sendNotification(userId: string, notification: any): Promise<void> {
    try {
      // Store notification
      if (!this.notifications.has(userId)) {
        this.notifications.set(userId, []);
      }
      
      const userNotifications = this.notifications.get(userId) || [];
      userNotifications.push({
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      });
      
      this.notifications.set(userId, userNotifications);

      // Send real-time notification
      this.io.to(`user-${userId}`).emit('notification', notification);
      
      console.log(`📱 Notification sent to user ${userId}:`, notification.title);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async sendQuestNotification(questId: string, notification: any): Promise<void> {
    try {
      this.io.to(`quest-${questId}`).emit('quest-notification', notification);
      console.log(`📱 Quest notification sent to quest ${questId}:`, notification.title);
    } catch (error) {
      console.error('Error sending quest notification:', error);
    }
  }

  async sendGlobalNotification(notification: any): Promise<void> {
    try {
      this.io.emit('global-notification', notification);
      console.log(`📱 Global notification sent:`, notification.title);
    } catch (error) {
      console.error('Error sending global notification:', error);
    }
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    return this.notifications.get(userId) || [];
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      this.notifications.set(userId, userNotifications);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(notification => {
      notification.read = true;
    });
    this.notifications.set(userId, userNotifications);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.read).length;
  }

  async updateLeaderboard(questId: string): Promise<void> {
    try {
      // This would typically fetch updated leaderboard data
      // For now, we'll send a generic update notification
      const notification = {
        type: 'leaderboard-update',
        questId,
        message: 'Leaderboard has been updated!',
        timestamp: new Date(),
      };

      this.io.to(`quest-${questId}`).emit('leaderboard-update', notification);
      console.log(`📊 Leaderboard update sent for quest ${questId}`);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  async sendStarDiscoveryNotification(userId: string, starData: any): Promise<void> {
    const notification = {
      type: 'star-discovered',
      title: '🌟 Star Discovered!',
      message: `You found ${starData.name}!`,
      starData,
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification);
  }

  async sendQuestCompletionNotification(userId: string, questData: any): Promise<void> {
    const notification = {
      type: 'quest-completed',
      title: '🎉 Quest Completed!',
      message: `You completed ${questData.title}!`,
      questData,
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification);
  }

  async sendAchievementNotification(userId: string, achievement: any): Promise<void> {
    const notification = {
      type: 'achievement-unlocked',
      title: '🏆 Achievement Unlocked!',
      message: `You earned the ${achievement.name} achievement!`,
      achievement,
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification);
  }

  async sendRewardNotification(userId: string, reward: any): Promise<void> {
    const notification = {
      type: 'reward-earned',
      title: '🎁 Reward Earned!',
      message: `You earned ${reward.points} points and a ${reward.rarity} NFT!`,
      reward,
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification);
  }

  async sendChallengeNotification(userId: string, challenge: any): Promise<void> {
    const notification = {
      type: 'challenge-available',
      title: '⚔️ New Challenge Available!',
      message: `A new challenge awaits: ${challenge.title}`,
      challenge,
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification);
  }

  async sendStreakNotification(userId: string, streak: number): Promise<void> {
    const notification = {
      type: 'streak-update',
      title: '🔥 Streak Update!',
      message: `You're on a ${streak} day streak! Keep it up!`,
      streak,
      timestamp: new Date(),
    };

    await this.sendNotification(userId, notification);
  }

  async sendMaintenanceNotification(message: string): Promise<void> {
    const notification = {
      type: 'maintenance',
      title: '🔧 Maintenance Notice',
      message,
      timestamp: new Date(),
    };

    await this.sendGlobalNotification(notification);
  }

  async sendEventNotification(event: any): Promise<void> {
    const notification = {
      type: 'event',
      title: '🎉 Special Event!',
      message: event.description,
      event,
      timestamp: new Date(),
    };

    await this.sendGlobalNotification(notification);
  }
}
