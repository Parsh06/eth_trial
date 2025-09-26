import mongoose, { Document } from 'mongoose';
export interface IQuest extends Document {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
    category: 'exploration' | 'puzzle' | 'social' | 'creative' | 'challenge';
    location: {
        name: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        radius: number;
    };
    stars: string[];
    rewards: {
        experience: number;
        nft?: string;
        tokens?: number;
    };
    requirements: {
        minLevel?: number;
        completedQuests?: string[];
        specialItems?: string[];
    };
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    creator: string;
    participants: string[];
    maxParticipants?: number;
    startDate: Date;
    endDate?: Date;
    metadata: {
        tags: string[];
        featured: boolean;
        verified: boolean;
        rating: number;
        completionRate: number;
    };
    createdAt: Date;
    updatedAt: Date;
    participantCount: number;
    isFull: boolean;
    addParticipant(userId: string): Promise<IQuest>;
    removeParticipant(userId: string): Promise<IQuest>;
    updateCompletionRate(): Promise<IQuest>;
}
export declare const Quest: mongoose.Model<IQuest, {}, {}, {}, mongoose.Document<unknown, {}, IQuest, {}, {}> & IQuest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Quest.d.ts.map