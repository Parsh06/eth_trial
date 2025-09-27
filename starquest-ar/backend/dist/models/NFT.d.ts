import mongoose, { Document } from 'mongoose';
export interface INFT extends Document {
    tokenId: string;
    contractAddress: string;
    name: string;
    description: string;
    image: string;
    imageUrl: string;
    animationUrl?: string;
    externalUrl?: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    starType: 'cosmic' | 'elemental' | 'mystical' | 'digital' | 'crystal';
    attributes: Array<{
        trait_type: string;
        value: string | number;
        display_type?: string;
        max_value?: number;
    }>;
    metadata: {
        background_color?: string;
        youtube_url?: string;
        external_url?: string;
        animation_url?: string;
        properties?: Record<string, any>;
        stats?: Record<string, number>;
    };
    owner: string;
    discoverer: string;
    discoveredAt: Date;
    claimedAt?: Date;
    starId: string;
    questId?: string;
    blockchain: {
        network: string;
        transactionHash?: string;
        blockNumber?: number;
        contractAddress: string;
    };
    stats: {
        views: number;
        likes: number;
        transfers: number;
    };
    status: 'minted' | 'transferred' | 'burned' | 'locked';
    createdAt: Date;
    updatedAt: Date;
    incrementViews(): Promise<INFT>;
    incrementLikes(): Promise<INFT>;
    transfer(newOwner: string, transactionHash?: string): Promise<INFT>;
}
export declare const NFT: mongoose.Model<INFT, {}, {}, {}, mongoose.Document<unknown, {}, INFT, {}, {}> & INFT & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=NFT.d.ts.map