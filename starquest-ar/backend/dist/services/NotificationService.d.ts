import { Server } from 'socket.io';
export declare class NotificationService {
    private io;
    private notifications;
    constructor(io: Server);
    sendNotification(userId: string, notification: any): Promise<void>;
    sendQuestNotification(questId: string, notification: any): Promise<void>;
    sendGlobalNotification(notification: any): Promise<void>;
    getUserNotifications(userId: string): Promise<any[]>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<void>;
    markAllNotificationsAsRead(userId: string): Promise<void>;
    getUnreadNotificationCount(userId: string): Promise<number>;
    updateLeaderboard(questId: string): Promise<void>;
    sendStarDiscoveryNotification(userId: string, starData: any): Promise<void>;
    sendQuestCompletionNotification(userId: string, questData: any): Promise<void>;
    sendAchievementNotification(userId: string, achievement: any): Promise<void>;
    sendRewardNotification(userId: string, reward: any): Promise<void>;
    sendChallengeNotification(userId: string, challenge: any): Promise<void>;
    sendStreakNotification(userId: string, streak: number): Promise<void>;
    sendMaintenanceNotification(message: string): Promise<void>;
    sendEventNotification(event: any): Promise<void>;
}
//# sourceMappingURL=NotificationService.d.ts.map