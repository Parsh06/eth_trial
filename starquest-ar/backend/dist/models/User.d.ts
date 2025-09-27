import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    walletAddress: string;
    username: string;
    email?: string;
    avatar?: string;
    level: number;
    experience: number;
    starsCollected: number;
    starsFound: number;
    questsCompleted: number;
    nftsEarned: number;
    nftsOwned: string[];
    achievements: string[];
    streak: number;
    starsDiscovered: number;
    tokens: number;
    stats: {
        totalQuests: number;
        completedQuests: number;
        totalStars: number;
        streak: number;
        lastActive: Date;
    };
    preferences: {
        notifications: boolean;
        privacy: 'public' | 'friends' | 'private';
        theme: 'light' | 'dark' | 'auto';
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map