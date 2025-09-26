import { ethers } from 'ethers';
export declare class Web3Service {
    private provider;
    private web3;
    private isConnectedFlag;
    constructor();
    private initializeProvider;
    isConnected(): boolean;
    getBalance(address: string): Promise<string>;
    getTransactionCount(address: string): Promise<number>;
    verifySignature(message: string, signature: string, address: string): Promise<boolean>;
    getContractInstance(contractAddress: string, abi: any[]): Promise<ethers.Contract>;
    callContractMethod(contractAddress: string, abi: any[], methodName: string, ...args: any[]): Promise<any>;
    sendTransaction(to: string, value: string, data?: string): Promise<{
        hash: string;
    }>;
    getNetworkInfo(): Promise<{
        chainId: string;
        name: string;
        ensAddress: any;
    }>;
}
//# sourceMappingURL=Web3Service.d.ts.map