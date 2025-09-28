import SignClient from '@walletconnect/sign-client';
import { getSdkError } from '@walletconnect/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Alert } from 'react-native';

export interface WalletConnectState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  accounts: string[];
  error: string | null;
}

const initialState: WalletConnectState = {
  isConnected: false,
  address: null,
  chainId: null,
  accounts: [],
  error: null,
};

export class WalletConnectService {
  private static instance: WalletConnectService;
  private signClient: SignClient | null = null;
  private session: any = null;
  private listeners: ((state: WalletConnectState) => void)[] = [];
  private currentState: WalletConnectState = initialState;

  private constructor() {}

  public static getInstance(): WalletConnectService {
    if (!WalletConnectService.instance) {
      WalletConnectService.instance = new WalletConnectService();
    }
    return WalletConnectService.instance;
  }

  // Initialize WalletConnect
  async initialize(): Promise<void> {
    try {
      console.log('🔗 Initializing WalletConnect v2...');
      
      this.signClient = await SignClient.init({
        projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
        metadata: {
          name: 'StarQuest AR',
          description: 'AR Gaming dApp with NFT collection',
          url: 'https://starquest.ar',
          icons: ['https://walletconnect.com/walletconnect-logo.png'],
        },
      });

      // Set up event listeners
      this.signClient.on('session_proposal', this.onSessionProposal.bind(this));
      this.signClient.on('session_event', this.onSessionEvent.bind(this));
      this.signClient.on('session_update', this.onSessionUpdate.bind(this));
      this.signClient.on('session_delete', this.onSessionDelete.bind(this));

      // Check for existing sessions
      await this.checkExistingSession();
      
      console.log('✅ WalletConnect initialized successfully');
    } catch (error) {
      console.error('❌ WalletConnect initialization failed:', error);
      throw error;
    }
  }

  // Check for existing session
  private async checkExistingSession(): Promise<void> {
    if (!this.signClient) return;

    const sessions = this.signClient.session.getAll();
    if (sessions.length > 0) {
      const session = sessions[0]; // Use the first session
      this.session = session;
      
      const { accounts } = session.namespaces.eip155;
      const address = accounts[0]?.split(':')[2];
      const chainId = accounts[0]?.split(':')[1];

      this.updateState({
        isConnected: true,
        address: address || null,
        chainId: chainId ? `0x${parseInt(chainId).toString(16)}` : null,
        accounts: accounts.map(acc => acc.split(':')[2]),
        error: null,
      });

      console.log('🔄 Restored WalletConnect session:', address);
    }
  }

  // Connect to wallet
  async connect(): Promise<WalletConnectState> {
    try {
      if (!this.signClient) {
        await this.initialize();
      }

      console.log('🦊 Starting WalletConnect connection...');

      const { uri, approval } = await this.signClient!.connect({
        requiredNamespaces: {
          eip155: {
            methods: [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData',
            ],
            chains: ['eip155:1'], // Ethereum mainnet
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });

      if (uri) {
        console.log('📱 Opening MetaMask with WalletConnect URI...');
        await this.openMetaMask(uri);

        // Show user instruction
        Alert.alert(
          'Connecting to MetaMask',
          'MetaMask should have opened. Please approve the connection request and return to this app.',
          [{ text: 'OK' }]
        );

        // Wait for approval
        console.log('⏳ Waiting for wallet approval...');
        const session = await approval();
        
        this.session = session;
        const { accounts } = session.namespaces.eip155;
        const address = accounts[0]?.split(':')[2];
        const chainId = accounts[0]?.split(':')[1];

        const connectedState: WalletConnectState = {
          isConnected: true,
          address: address || null,
          chainId: chainId ? `0x${parseInt(chainId).toString(16)}` : null,
          accounts: accounts.map(acc => acc.split(':')[2]),
          error: null,
        };

        this.updateState(connectedState);
        
        // Save session
        await AsyncStorage.setItem('wc_session', JSON.stringify(session));
        
        console.log('✅ WalletConnect connected:', address);
        
        Alert.alert(
          'Wallet Connected! 🎉',
          `Successfully connected to MetaMask!\n\nAddress: ${this.formatAddress(address || '')}\nNetwork: Ethereum Mainnet`,
          [{ text: 'Continue' }]
        );

        return connectedState;
      }

      throw new Error('Failed to generate connection URI');
      
    } catch (error: any) {
      console.error('❌ WalletConnect connection failed:', error);
      
      const errorState: WalletConnectState = {
        ...initialState,
        error: error.message || 'Connection failed',
      };
      
      this.updateState(errorState);
      return errorState;
    }
  }

  // Open MetaMask with WalletConnect URI
  private async openMetaMask(uri: string): Promise<void> {
    try {
      const encodedUri = encodeURIComponent(uri);
      
      // Try multiple MetaMask deep link formats
      const deepLinks = [
        `https://metamask.app.link/wc?uri=${encodedUri}`,
        `metamask://wc?uri=${encodedUri}`,
        `https://metamask.app.link/dapp/bridge.walletconnect.org?uri=${encodedUri}`,
      ];

      for (const link of deepLinks) {
        try {
          const canOpen = await Linking.canOpenURL(link);
          if (canOpen) {
            console.log(`🔗 Opening: ${link}`);
            await Linking.openURL(link);
            return;
          }
        } catch (error) {
          console.log(`❌ Failed to open: ${link}`);
        }
      }

      // Fallback: just open MetaMask
      await Linking.openURL('metamask://');
      
    } catch (error) {
      console.error('❌ Error opening MetaMask:', error);
      throw error;
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    try {
      if (this.signClient && this.session) {
        await this.signClient.disconnect({
          topic: this.session.topic,
          reason: getSdkError('USER_DISCONNECTED'),
        });
      }
      
      this.session = null;
      await AsyncStorage.removeItem('wc_session');
      
      this.updateState(initialState);
      console.log('🔌 WalletConnect disconnected');
      
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  }

  // Send transaction
  async sendTransaction(transaction: any): Promise<string> {
    if (!this.signClient || !this.session) {
      throw new Error('Not connected');
    }

    try {
      const result = await this.signClient.request({
        topic: this.session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'eth_sendTransaction',
          params: [transaction],
        },
      });

      return result as string;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  // Sign message
  async signMessage(message: string): Promise<string> {
    if (!this.signClient || !this.session) {
      throw new Error('Not connected');
    }

    try {
      const result = await this.signClient.request({
        topic: this.session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [message, this.currentState.address],
        },
      });

      return result as string;
    } catch (error) {
      console.error('❌ Sign message failed:', error);
      throw error;
    }
  }

  // Event handlers
  private onSessionProposal(event: any): void {
    console.log('📋 Session proposal:', event);
    // Auto-approve for now (in production, you might want user confirmation)
  }

  private onSessionEvent(event: any): void {
    console.log('📅 Session event:', event);
  }

  private onSessionUpdate(event: any): void {
    console.log('🔄 Session updated:', event);
  }

  private onSessionDelete(event: any): void {
    console.log('🗑️ Session deleted:', event);
    this.session = null;
    this.updateState(initialState);
  }

  // State management
  private updateState(newState: WalletConnectState): void {
    this.currentState = newState;
    this.notifyListeners(newState);
  }

  private notifyListeners(state: WalletConnectState): void {
    this.listeners.forEach(listener => listener(state));
  }

  // Add/remove listeners
  addListener(listener: (state: WalletConnectState) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (state: WalletConnectState) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Helper functions
  getCurrentState(): WalletConnectState {
    return this.currentState;
  }

  private formatAddress(address: string): string {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Export singleton instance
export const walletConnectService = WalletConnectService.getInstance();
