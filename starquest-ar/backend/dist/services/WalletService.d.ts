import { Web3Service } from './Web3Service';
import { INFT } from '../models/NFT';
export declare class WalletService {
    private web3Service;
    constructor(web3Service: Web3Service);
    getUserNFTs(walletAddress: string, options?: {
        limit?: number;
        offset?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        rarity?: string;
        starType?: string;
        status?: string;
    }): Promise<{
        nfts: INFT[];
        total: number;
        hasMore: boolean;
        statistics: {
            totalNFTs: number;
            rarityBreakdown: Record<string, number>;
            typeBreakdown: Record<string, number>;
            totalValue: number;
        };
    }>;
    getNFTDetails(contractAddress: string, tokenId: string): Promise<INFT | null>;
    getWalletSummary(walletAddress: string): Promise<{
        totalNFTs: number;
        totalValue: number;
        rarityDistribution: Record<string, number>;
        typeDistribution: Record<string, number>;
        recentActivity: Array<{
            type: string;
            nftId: string;
            timestamp: Date;
            details: any;
        }>;
        topNFTs: INFT[];
        achievements: string[];
    }>;
    getWalletInfo(walletAddress: string): Promise<{
        balance: string;
        network: any;
        transactionCount: number;
        isConnected: boolean;
    }>;
    createNFT(starData: {
        starId: string;
        tokenId: string;
        contractAddress: string;
        owner: string;
        discoverer: string;
        name: string;
        description: string;
        imageUrl: string;
        rarity: string;
        starType: string;
        attributes: Array<any>;
        questId?: string;
        transactionHash?: string;
    }): Promise<INFT>;
    transferNFT(contractAddress: string, tokenId: string, fromAddress: string, toAddress: string, transactionHash?: string): Promise<INFT>;
    getNFTMetadata(contractAddress: string, tokenId: string): Promise<any>;
}
//# sourceMappingURL=WalletService.d.ts.map