# StarQuest AR - Gamified AR Scavenger Hunt

A React Native mobile application built with Expo that simulates an AR scavenger hunt experience with Web3 integration and neo-brutalist design aesthetics.

## 🎯 Overview

StarQuest AR is a gamified augmented reality scavenger hunt application where users discover hidden stars in the real world, complete AI-powered challenges, and collect NFT rewards. The app features a bold neo-brutalist design with vibrant colors and playful animations.

## 🚀 Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Camera**: Expo Camera with QR Code scanning
- **Animations**: React Native Reanimated
- **Icons**: Expo Vector Icons
- **Haptics**: Expo Haptics for tactile feedback

## 🎨 Design System

### Neo-Brutalist Aesthetics
- **Bold Typography**: Custom font weights and sizes
- **High Contrast Colors**: Electric color palette with strong contrasts
- **Geometric Shapes**: Sharp corners and defined borders
- **Thick Borders**: 3-4px borders with shadow effects
- **Vibrant Colors**: Electric purple, green, orange, and pink

### Color Palette
```typescript
// Primary Colors
primary: '#8B5CF6' // Electric Purple
electricGreen: '#10B981'
electricOrange: '#F59E0B'
electricPink: '#EC4899'

// Status Colors
starAvailable: '#8B5CF6'
starCompleted: '#10B981'
starLocked: '#94A3B8'
```

## 📱 Application Features

### Core Screens (9 Total)

#### 1. Onboarding Screen
- 3-slide carousel with navigation indicators
- Welcome message, how-to-play instructions, and wallet connection prompt
- Auto-transition to wallet connect on completion

#### 2. Wallet Connect Screen
- QR code placeholder for WalletConnect integration
- Primary connect button with wallet icon
- Guest mode option
- Supported wallets: MetaMask, WalletConnect, Coinbase, Trust Wallet

#### 3. Home Dashboard
- Personalized welcome message with wallet status
- Mini stats cards (Stars Found, Quests Completed, NFTs Earned)
- Quick action buttons for navigation
- Recent activity feed with timestamps
- Progress indicators and achievement badges

#### 4. Map Screen
- Interactive 3x4 grid showing AR star locations
- Star status indicators (available, completed, locked)
- Interactive star selection with haptic feedback
- Location-based star unlocking system
- Star difficulty indicators and reward previews

#### 5. Challenge Screen
- Dynamic challenge types (trivia, puzzles, creative tasks, AR scanning)
- Multiple input methods (text input, multiple choice, QR scanning)
- Real-time validation and feedback
- Hint system with progressive disclosure
- Timer-based challenges with countdown
- Success/failure animations

#### 6. Reward Screen
- 3D NFT preview with rotation controls
- Detailed metadata display (name, rarity, attributes)
- Blockchain transaction information
- "View in Wallet" integration
- Social sharing capabilities
- Rarity-based visual effects

#### 7. Quest List Screen
- Categorized quest display (Daily, Weekly, Epic)
- Progress tracking with visual progress bars
- Difficulty indicators (Beginner, Intermediate, Expert)
- Reward previews and estimated completion times
- Filter and sort functionality

#### 8. Leaderboard Screen
- Multiple leaderboard categories (Stars, NFTs, Streaks)
- User ranking with avatar and wallet address display
- Real-time score updates and position changes
- Achievement badges and special titles
- Challenge other players functionality

#### 9. Profile Screen
- Wallet connection management
- Avatar customization system
- Game statistics and achievement gallery
- Settings (notifications, AR preferences, privacy)
- Account data export and deletion options

## 🧩 Custom Components

### NeoButton
**Variants**: `default`, `electric`, `outline`, `ghost`
**Sizes**: `sm`, `default`, `lg`, `icon`
**Features**: Built-in loading states, disabled states, custom animations

### NeoCard
**Purpose**: Container component with neo-brutalist styling
**Features**: Thick black borders, customizable background colors, shadow effects

### ProgressBar
**Purpose**: Animated progress visualization
**Features**: Smooth fill animations, color-coded progress levels, percentage display

### QRScanner
**Purpose**: Camera-based QR code scanning for AR interactions
**Features**: Real-time scanning, permission handling, overlay UI

## 🎮 Game Mechanics

### Star Collection System
- **Grid Layout**: 3x4 grid with 12 collectible stars
- **Star States**: Available (purple), Completed (green), Locked (gray)
- **Progressive Unlocking**: Stars unlock based on location and completion
- **Difficulty Scaling**: Challenges increase in complexity

### Challenge Types
1. **Trivia Questions**: Knowledge-based challenges with multiple choice
2. **Creative Tasks**: Photo/video submission with AI validation  
3. **Puzzle Solving**: Logic puzzles and brain teasers
4. **AR Interactions**: Scan real-world objects or QR codes
5. **Social Challenges**: Team-based or community challenges

### Reward System
- **NFT Collection**: Unique digital collectibles for each star
- **Rarity Levels**: Common, Rare, Epic, Legendary
- **Achievement Badges**: Special rewards for milestones
- **Streak Bonuses**: Consecutive day completion rewards

## 🛠️ Installation & Setup

### Prerequisites
```bash
Node.js 18+ 
npm or yarn package manager
Expo CLI
```

### Installation Steps
```bash
# Navigate to project directory
cd StarQuestAR

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run android  # Android
npm run ios      # iOS (requires macOS)
npm run web      # Web browser
```

### Key Dependencies
```json
{
  "expo": "~54.0.10",
  "expo-camera": "^17.0.8",
  "expo-barcode-scanner": "^13.0.1",
  "expo-haptics": "^15.0.7",
  "@react-navigation/native": "^7.1.17",
  "@react-navigation/bottom-tabs": "^7.4.7",
  "react-native-reanimated": "^4.1.2"
}
```

## 📁 Project Structure
```
StarQuestAR/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── NeoButton.tsx       # Custom neo-brutalist button
│   │   │   ├── NeoCard.tsx         # Neo-brutalist card component  
│   │   │   └── ProgressBar.tsx     # Animated progress indicator
│   │   ├── layout/
│   │   │   ├── MobileLayout.tsx    # Mobile app layout wrapper
│   │   │   └── BottomNav.tsx       # Bottom tab navigation
│   │   └── QRScanner.tsx           # QR code scanner component
│   ├── screens/
│   │   ├── OnboardingScreen.tsx    # Welcome carousel
│   │   ├── WalletConnectScreen.tsx # Web3 wallet connection
│   │   ├── HomeScreen.tsx          # Main dashboard
│   │   ├── MapScreen.tsx           # Interactive star map
│   │   ├── ChallengeScreen.tsx     # Challenge interface  
│   │   ├── RewardScreen.tsx        # NFT reward display
│   │   ├── QuestListScreen.tsx     # Quest management
│   │   ├── LeaderboardScreen.tsx   # Social rankings
│   │   └── ProfileScreen.tsx       # User settings
│   ├── context/
│   │   └── GameContext.tsx          # Global state management
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── utils/
│   │   ├── colors.ts               # Color palette
│   │   ├── typography.ts           # Typography system
│   │   └── animations.ts           # Animation utilities
│   └── App.tsx                     # Main app component
├── App.tsx                         # Expo entry point
└── package.json                   # Dependencies and scripts
```

## 🔧 Configuration

### Expo Configuration
The app is configured for:
- **Camera permissions** for QR code scanning
- **Haptic feedback** for tactile interactions
- **Linear gradients** for visual effects
- **Status bar** customization

### Navigation Flow
```
Onboarding → Wallet Connect → Main App
                              ├── Home (default)
                              ├── Map → Challenge → Reward
                              ├── Quest List → Challenge → Reward  
                              ├── Leaderboard
                              └── Profile
```

## 🎨 Key Features Implementation

### Neo-Brutalist Design System
- **Bold Typography**: Custom font weights and sizes
- **High Contrast Colors**: Electric color palette with strong contrasts
- **Geometric Shapes**: Sharp corners and defined borders
- **Minimal Gradients**: Flat colors with selective gradient usage
- **Playful Animations**: Bouncy, energetic motion design

### Mobile-First Responsive Design
- **Consistent Layout**: Fixed mobile viewport (430px max-width)
- **Touch-Friendly**: Large tap targets and gesture support
- **Performance Optimized**: Efficient rendering and animations
- **Cross-Platform**: Works on iOS, Android, and web browsers

### Web3 Integration Ready
- **Wallet Connection**: Infrastructure for MetaMask, WalletConnect
- **NFT Display**: Metadata parsing and 3D model support
- **Blockchain Integration**: Transaction tracking and verification
- **Multi-Chain Support**: Ethereum, Polygon, and other networks

### Gamification Elements
- **Progress Tracking**: Visual progress bars and completion states
- **Achievement System**: Badges, streaks, and milestone rewards
- **Social Features**: Leaderboards and competitive elements
- **Reward Mechanics**: NFT collection and rarity systems

## 🚀 Deployment

The application is ready for deployment on:
- **Expo Go**: Development and testing
- **EAS Build**: Production builds for app stores
- **Web**: Browser-based deployment
- **Custom Development**: Standalone React Native builds

### Environment Variables
```bash
# Optional Web3 integration
EXPO_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
EXPO_PUBLIC_BLOCKCHAIN_NETWORK=ethereum
EXPO_PUBLIC_NFT_METADATA_URL=https://api.example.com/metadata
```

## 🎯 Usage

1. **Start the app** and complete the onboarding flow
2. **Connect your wallet** or continue as a guest
3. **Explore the map** to find available stars
4. **Complete challenges** to earn NFTs
5. **Track your progress** on the leaderboard
6. **Share achievements** with friends

## 🤝 Contributing

This codebase is designed to be easily extensible:
1. Add new challenge types in the Challenge screen
2. Extend the reward system with additional NFT attributes
3. Implement real AR camera integration
4. Add multiplayer and social features
5. Integrate with actual blockchain networks

## 📄 License

This project serves as a template and starter kit for AR gamification applications with Web3 integration.

---

**StarQuest AR** - A gamified AR scavenger hunt with Web3 integration and neo-brutalist design.

