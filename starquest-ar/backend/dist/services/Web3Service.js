"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Service = void 0;
const ethers_1 = require("ethers");
const web3_1 = require("web3");
class Web3Service {
    constructor() {
        this.provider = null;
        this.web3 = null;
        this.isConnectedFlag = false;
        this.initializeProvider();
    }
    initializeProvider() {
        try {
            const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id';
            this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
            this.web3 = new web3_1.Web3(rpcUrl);
            this.isConnectedFlag = true;
            console.log('✅ Web3 service initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize Web3 service:', error);
            this.isConnectedFlag = false;
        }
    }
    isConnected() {
        return this.isConnectedFlag;
    }
    async getBalance(address) {
        if (!this.provider) {
            throw new Error('Web3 provider not initialized');
        }
        try {
            const balance = await this.provider.getBalance(address);
            return ethers_1.ethers.formatEther(balance);
        }
        catch (error) {
            console.error('Error getting balance:', error);
            throw new Error('Failed to get balance');
        }
    }
    async getTransactionCount(address) {
        if (!this.provider) {
            throw new Error('Web3 provider not initialized');
        }
        try {
            return await this.provider.getTransactionCount(address);
        }
        catch (error) {
            console.error('Error getting transaction count:', error);
            throw new Error('Failed to get transaction count');
        }
    }
    async verifySignature(message, signature, address) {
        try {
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }
    async getContractInstance(contractAddress, abi) {
        if (!this.provider) {
            throw new Error('Web3 provider not initialized');
        }
        try {
            return new ethers_1.ethers.Contract(contractAddress, abi, this.provider);
        }
        catch (error) {
            console.error('Error creating contract instance:', error);
            throw new Error('Failed to create contract instance');
        }
    }
    async callContractMethod(contractAddress, abi, methodName, ...args) {
        try {
            const contract = await this.getContractInstance(contractAddress, abi);
            return await contract[methodName](...args);
        }
        catch (error) {
            console.error('Error calling contract method:', error);
            throw new Error(`Failed to call ${methodName}`);
        }
    }
    async sendTransaction(to, value, data) {
        if (!this.provider) {
            throw new Error('Web3 provider not initialized');
        }
        try {
            const tx = {
                to,
                value: ethers_1.ethers.parseEther(value),
                data: data || '0x',
            };
            console.log('Transaction would be sent:', tx);
            return { hash: '0x' + Math.random().toString(16).substr(2, 64) };
        }
        catch (error) {
            console.error('Error sending transaction:', error);
            throw new Error('Failed to send transaction');
        }
    }
    async getNetworkInfo() {
        if (!this.provider) {
            throw new Error('Web3 provider not initialized');
        }
        try {
            const network = await this.provider.getNetwork();
            return {
                chainId: network.chainId.toString(),
                name: network.name,
                ensAddress: network.ensAddress,
            };
        }
        catch (error) {
            console.error('Error getting network info:', error);
            throw new Error('Failed to get network info');
        }
    }
}
exports.Web3Service = Web3Service;
//# sourceMappingURL=Web3Service.js.map