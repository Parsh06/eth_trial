import mongoose from 'mongoose';
export declare function seedWalletCollection(): Promise<{
    user: mongoose.Document<unknown, {}, import("../models/User").IUser, {}, {}> & import("../models/User").IUser & Required<{
        _id: unknown;
    }> & {
        __v: number;
    };
    walletAddress: string;
    contractAddress: string;
    nftCount: number;
}>;
//# sourceMappingURL=wallet-collection-seeder.d.ts.map