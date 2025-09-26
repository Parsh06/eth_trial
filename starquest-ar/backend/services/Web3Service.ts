import { ethers } from 'ethers';
import { Web3 } from 'web3';

export class Web3Service {
  private provider: ethers.JsonRpcProvider | null = null;
  private web3: Web3 | null = null;
  private isConnectedFlag = false;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      // Initialize with a default RPC URL (you can make this configurable)
      const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.web3 = new Web3(rpcUrl);
      this.isConnectedFlag = true;
      console.log('✅ Web3 service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Web3 service:', error);
      this.isConnectedFlag = false;
    }
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Web3 provider not initialized');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  async getTransactionCount(address: string): Promise<number> {
    if (!this.provider) {
      throw new Error('Web3 provider not initialized');
    }

    try {
      return await this.provider.getTransactionCount(address);
    } catch (error) {
      console.error('Error getting transaction count:', error);
      throw new Error('Failed to get transaction count');
    }
  }

  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  async getContractInstance(contractAddress: string, abi: any[]) {
    if (!this.provider) {
      throw new Error('Web3 provider not initialized');
    }

    try {
      return new ethers.Contract(contractAddress, abi, this.provider);
    } catch (error) {
      console.error('Error creating contract instance:', error);
      throw new Error('Failed to create contract instance');
    }
  }

  async callContractMethod(contractAddress: string, abi: any[], methodName: string, ...args: any[]) {
    try {
      const contract = await this.getContractInstance(contractAddress, abi);
      return await contract[methodName](...args);
    } catch (error) {
      console.error('Error calling contract method:', error);
      throw new Error(`Failed to call ${methodName}`);
    }
  }

  async sendTransaction(to: string, value: string, data?: string) {
    if (!this.provider) {
      throw new Error('Web3 provider not initialized');
    }

    try {
      const tx = {
        to,
        value: ethers.parseEther(value),
        data: data || '0x',
      };

      // Note: In a real implementation, you'd need a wallet with private key
      // This is just for demonstration
      console.log('Transaction would be sent:', tx);
      return { hash: '0x' + Math.random().toString(16).substr(2, 64) };
    } catch (error) {
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
    } catch (error) {
      console.error('Error getting network info:', error);
      throw new Error('Failed to get network info');
    }
  }
}
