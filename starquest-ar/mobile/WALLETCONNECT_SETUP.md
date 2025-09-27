# WalletConnect AppKit Setup Guide

## 🚀 Quick Setup

### 1. Get Your Project ID

1. Visit [https://dashboard.reown.com](https://dashboard.reown.com)
2. Sign up or login to your account
3. Create a new project
4. Copy your Project ID

### 2. Configure Environment Variables

Update your `.env` file:

```bash
# Replace YOUR_PROJECT_ID with your actual project ID from dashboard.reown.com
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

### 3. Test the Integration

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to the Login Screen

3. Try the wallet connection:
   - **Connect Wallets**: Unified button that opens AppKit modal for all wallet connections
   - **AppKit Button**: Native WalletConnect button component
   - **Demo Mode**: Available in development for testing without wallet

## 🔧 Features Implemented

- ✅ AppKit modal integration
- ✅ Wagmi hooks for wallet connection
- ✅ Real message signing for authentication
- ✅ Support for Mainnet, Polygon, and Arbitrum
- ✅ Simplified single "Connect Wallets" interface
- ✅ Removed complex wallet detection in favor of WalletConnect
- ✅ Both AppKit button component and custom button support

## 📱 Supported Wallets

The AppKit integration supports 430+ wallets including:
- MetaMask
- WalletConnect-enabled wallets
- Trust Wallet
- Rainbow
- Coinbase Wallet (requires additional setup)
- And many more...

## 🐛 Troubleshooting

### Project ID Issues
- Make sure you've replaced `YOUR_PROJECT_ID` with your actual project ID
- Ensure the environment variable is properly loaded

### Connection Issues
- Check that your device has a wallet app installed
- Make sure the app is running on a device/emulator (not web)
- Verify that the wallet app supports WalletConnect v2

### Development Mode
- The app includes a demo mode for testing without wallet connection
- Available only in development builds (`__DEV__`)

## 🔧 Advanced Configuration

### Adding More Chains

Edit `src/config/walletConfig.ts`:

```typescript
import { mainnet, polygon, arbitrum, optimism, base } from '@wagmi/core/chains';

export const chains = [mainnet, polygon, arbitrum, optimism, base] as const;
```

### Customizing Metadata

Update the metadata in `src/config/walletConfig.ts`:

```typescript
export const metadata = {
  name: 'Your App Name',
  description: 'Your app description',
  url: 'https://yourapp.com',
  icons: ['https://your-app-icon-url.png'],
  redirect: {
    native: 'yourapp://',
    universal: 'https://yourapp.com',
  },
};
```

### Enable Analytics

Analytics are enabled by default. To disable:

```typescript
createAppKit({
  // ... other options
  enableAnalytics: false,
});
```

## 📚 Next Steps

1. Test with real wallets on a physical device
2. Add error handling for specific wallet scenarios
3. Implement wallet disconnection functionality
4. Add support for additional chains if needed
5. Consider adding Coinbase Wallet support (see AppKit docs)

## 🔗 References

- [Reown AppKit Documentation](https://docs.reown.com/appkit/react-native/overview)
- [WalletConnect Dashboard](https://dashboard.reown.com)
- [Wagmi Documentation](https://wagmi.sh/react/getting-started)
