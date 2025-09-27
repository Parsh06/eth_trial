import mongoose, { Document } from 'mongoose';
export interface IStar extends Document {
    name: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    type: 'cosmic' | 'elemental' | 'mystical' | 'digital' | 'crystal';
    location: {
        name: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
        altitude?: number;
    };
    quest: string;
    discoverer?: string;
    discoverers: string[];
    metadata: {
        arModel?: string;
        animation?: string;
        sound?: string;
        particleEffect?: string;
        glowColor?: string;
        size: number;
        rotation: {
            x: number;
            y: number;
            z: number;
        };
    };
    rewards: {
        experience: number;
        nft?: string;
        tokens?: number;
        specialItem?: string;
    };
    conditions: {
        timeOfDay?: 'day' | 'night' | 'dawn' | 'dusk' | 'any';
        weather?: string[];
        specialEvent?: string;
        requiredItems?: string[];
    };
    status: 'hidden' | 'discovered' | 'claimed' | 'expired' | 'available' | 'completed';
    discoveredBy?: string;
    discoveredAt?: Date;
    discoveryPosition?: {
        latitude: number;
        longitude: number;
    };
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    discoveryCount: number;
    isDiscoverable: boolean;
    addDiscoverer(userId: string): Promise<IStar>;
    removeDiscoverer(userId: string): Promise<IStar>;
    updateStatus(newStatus: string): Promise<IStar>;
    discover(userId: string): Promise<IStar>;
    claim(userId: string): Promise<IStar>;
}
export declare const Star: mongoose.Model<IStar, {}, {}, {}, mongoose.Document<unknown, {}, IStar, {}, {}> & IStar & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Star.d.ts.map