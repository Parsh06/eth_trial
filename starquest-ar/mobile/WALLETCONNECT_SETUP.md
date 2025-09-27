# WalletConnect Setup Guide

## ✅ Fixed Issues

The following compatibility issues have been resolved:
- ❌ `react-native-compat: Application module is not available` → ✅ **FIXED**
- ❌ Missing `react-native-modal` dependency → ✅ **FIXED**
- ❌ Missing crypto polyfills → ✅ **FIXED**
- ❌ Missing stream polyfills → ✅ **FIXED**

## Getting Your Project ID

1. Go to [https://dashboard.reown.com](https://dashboard.reown.com)
2. Sign up or log in to your account
3. Create a new project
4. Copy your Project ID
5. Replace the `projectId` in `src/config/wagmi.ts` with your actual project ID

## Current Configuration

The app is currently configured with:
- **Project ID**: `14ea17265d2b49b6a49b699b1669d6ca` (working demo ID)
- **App Scheme**: `starquestar://`
- **Supported Chains**: Mainnet, Polygon, Arbitrum

## How It Works

1. **Connect MetaMask Button**: Now opens the AppKit modal instead of directly connecting to MetaMask
2. **Wallet Selection**: Users can choose from multiple wallets (MetaMask, WalletConnect, etc.)
3. **Authentication**: After wallet connection, the app requests a signature for authentication
4. **Backend Integration**: The signature is sent to your backend for verification

## Features

- ✅ Multiple wallet support through AppKit
- ✅ Automatic signature verification
- ✅ Seamless integration with existing game context
- ✅ Error handling and user feedback
- ✅ Demo mode for development testing

## Testing

1. Start the app: `npm start`
2. Click "Connect MetaMask" button
3. The AppKit modal should open
4. Select your preferred wallet
5. Complete the connection and signature flow

## What Was Fixed

### 1. Added Required Dependencies
```bash
npm install react-native-modal react-native-url-polyfill readable-stream buffer process
```

### 2. Created Polyfills File (`src/polyfills.ts`)
- Crypto polyfills with `react-native-get-random-values`
- URL polyfills with `react-native-url-polyfill`
- Buffer and process polyfills for Node.js compatibility
- WalletConnect React Native compatibility layer

### 3. Updated Metro Configuration
- Added resolver aliases for crypto, stream, buffer, and process modules
- Configured proper module resolution for React Native
- Added support for `.cjs` file extensions

### 4. Updated Import Order
- Polyfills are now imported first in `App.tsx`
- Ensures all dependencies are available before WalletConnect initializes

## Troubleshooting

- ✅ **All major compatibility issues resolved**
- Make sure you have a valid Project ID from Reown/WalletConnect
- Verify that the app scheme matches in `app.json`
- Check that all required dependencies are installed
- For mobile testing, ensure the wallet app is installed on the device
- If you see crypto errors, restart Metro bundler with `npx expo start --clear` 