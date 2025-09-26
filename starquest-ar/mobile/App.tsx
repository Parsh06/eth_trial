import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ViewStyle, TextStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GameProvider, useGame } from './src/context/GameContext';
import { colors } from './src/utils/colors';
import { typography } from './src/utils/typography';

// Type definitions
interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'electric' | 'outline';
  style?: ViewStyle;
  [key: string]: any;
}

interface NeoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  [key: string]: any;
}

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ id: string; label: string; icon: string }>;
}

// Simple Button Component
const NeoButton: React.FC<NeoButtonProps> = ({ title, onPress, variant = 'default', style, ...props }) => {
  const getButtonStyle = (): ViewStyle => ({
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.foreground,
    backgroundColor: variant === 'electric' ? colors.electricPurple : colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 8,
    ...style,
  });

  const getTextStyle = (): TextStyle => ({
    ...typography.body,
    color: colors.primaryForeground,
    fontWeight: '700' as const,
  });

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} {...props}>
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

// Simple Card Component
const NeoCard: React.FC<NeoCardProps> = ({ children, style, onPress, ...props }) => {
  const cardStyle: ViewStyle = {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.foreground,
    backgroundColor: colors.background,
    padding: 16,
    marginVertical: 8,
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

// Bottom Navigation Component
const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab,
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={[
            styles.tabIcon,
            activeTab === tab.id && styles.activeTabIcon,
          ]}>
            {tab.icon}
          </Text>
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.activeTabLabel,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Main App Content
const AppContent = () => {
  const { state, handleTabChange, handleOnboardingComplete, handleWalletConnect } = useGame();

  const bottomNavTabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'quests', label: 'Quests', icon: '⚔️' },
    { id: 'leaderboard', label: 'Rankings', icon: '🏆' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const renderScreen = () => {
    switch (state.screen) {
      case 'onboarding':
        return (
          <View style={styles.container}>
            <NeoCard style={styles.welcomeCard} onPress={() => {}}>
              <Text style={styles.welcomeTitle}>🌟 Welcome to StarQuest AR! 🌟</Text>
              <Text style={styles.welcomeText}>
                Discover hidden stars in the real world and collect amazing NFT rewards!
              </Text>
              <NeoButton
                title="Get Started"
                onPress={handleOnboardingComplete}
                variant="electric"
                style={styles.startButton}
              />
            </NeoCard>
          </View>
        );
      case 'wallet-connect':
        return (
          <View style={styles.container}>
            <NeoCard style={styles.walletCard} onPress={() => {}}>
              <Text style={styles.walletTitle}>Connect Your Wallet</Text>
              <Text style={styles.walletText}>
                Link your Web3 wallet to start collecting NFTs
              </Text>
              <NeoButton
                title="Connect Wallet"
                onPress={() => handleWalletConnect('0x1234...5678')}
                variant="electric"
                style={styles.connectButton}
              />
              <NeoButton
                title="Continue as Guest"
                onPress={() => handleWalletConnect('guest')}
                variant="outline"
                style={styles.guestButton}
              />
            </NeoCard>
          </View>
        );
      case 'main':
        switch (state.activeTab) {
          case 'home':
            return (
              <ScrollView style={styles.container}>
                <Text style={styles.screenTitle}>🏠 Home Dashboard</Text>
                <NeoCard style={styles.statsCard} onPress={() => {}}>
                  <Text style={styles.statsTitle}>Your Progress</Text>
                  <Text style={styles.statsText}>⭐ Stars Found: 3/12</Text>
                  <Text style={styles.statsText}>🎁 NFTs Earned: 3</Text>
                  <Text style={styles.statsText}>🔥 Current Streak: 5 days</Text>
                </NeoCard>
                <NeoCard style={styles.quickActionsCard} onPress={() => {}}>
                  <Text style={styles.actionsTitle}>Quick Actions</Text>
                  <NeoButton title="Explore Map" onPress={() => handleTabChange('map')} style={{}} />
                  <NeoButton title="View Quests" onPress={() => handleTabChange('quests')} style={{}} />
                  <NeoButton title="Check Leaderboard" onPress={() => handleTabChange('leaderboard')} style={{}} />
                </NeoCard>
              </ScrollView>
            );
          case 'map':
            return (
              <ScrollView style={styles.container}>
                <Text style={styles.screenTitle}>🗺️ Star Map</Text>
                <NeoCard style={styles.mapCard}>
                  <Text style={styles.mapText}>Interactive star map with AR functionality!</Text>
                  <Text style={styles.mapSubtext}>Find and collect stars in the real world</Text>
                </NeoCard>
                <NeoCard style={styles.starGrid}>
                  <Text style={styles.gridTitle}>Star Collection</Text>
                  <View style={styles.starsContainer}>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.star}>⭐</Text>
                    <Text style={styles.star}>🔒</Text>
                  </View>
                </NeoCard>
              </ScrollView>
            );
          case 'quests':
            return (
              <ScrollView style={styles.container}>
                <Text style={styles.screenTitle}>⚔️ Quests</Text>
                <NeoCard style={styles.questCard}>
                  <Text style={styles.questTitle}>Daily Star Hunt</Text>
                  <Text style={styles.questText}>Find 3 stars today</Text>
                  <Text style={styles.questProgress}>Progress: 2/3</Text>
                </NeoCard>
                <NeoCard style={styles.questCard}>
                  <Text style={styles.questTitle}>Weekly Explorer</Text>
                  <Text style={styles.questText}>Complete 10 challenges this week</Text>
                  <Text style={styles.questProgress}>Progress: 7/10</Text>
                </NeoCard>
              </ScrollView>
            );
          case 'leaderboard':
            return (
              <ScrollView style={styles.container}>
                <Text style={styles.screenTitle}>🏆 Leaderboard</Text>
                <NeoCard style={styles.leaderboardCard}>
                  <Text style={styles.leaderboardTitle}>Top Star Hunters</Text>
                  <Text style={styles.rankText}>1. StarMaster - 1500 points</Text>
                  <Text style={styles.rankText}>2. You - 1200 points</Text>
                  <Text style={styles.rankText}>3. CosmicHunter - 1000 points</Text>
                </NeoCard>
              </ScrollView>
            );
          case 'profile':
            return (
              <ScrollView style={styles.container}>
                <Text style={styles.screenTitle}>👤 Profile</Text>
                <NeoCard style={styles.profileCard}>
                  <Text style={styles.profileTitle}>StarHunter</Text>
                  <Text style={styles.profileText}>Wallet: 0x1234...5678</Text>
                  <Text style={styles.profileText}>Level: Expert</Text>
                </NeoCard>
                <NeoCard style={styles.settingsCard}>
                  <Text style={styles.settingsTitle}>Settings</Text>
                  <NeoButton title="Notifications" onPress={() => {}} />
                  <NeoButton title="Privacy" onPress={() => {}} />
                  <NeoButton title="Support" onPress={() => {}} />
                </NeoCard>
              </ScrollView>
            );
          default:
            return (
              <View style={styles.container}>
                <Text style={styles.screenTitle}>🏠 Home</Text>
              </View>
            );
        }
      default:
  return (
    <View style={styles.container}>
            <Text style={styles.screenTitle}>🌟 StarQuest AR</Text>
    </View>
        );
    }
  };

  const shouldShowBottomNav = state.screen === 'main';

  return (
    <View style={styles.appContainer}>
      {Platform.OS !== 'web' && <StatusBar style="dark" />}
      {renderScreen()}
      {shouldShowBottomNav && (
        <BottomNav
          activeTab={state.activeTab || 'home'}
          onTabChange={handleTabChange}
          tabs={bottomNavTabs}
        />
      )}
    </View>
  );
};

// Main App Component
export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  welcomeCard: {
    alignItems: 'center' as const,
    padding: 40,
    backgroundColor: colors.electricPurple,
  },
  welcomeTitle: {
    ...typography.brutalLarge,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    ...typography.body,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    marginTop: 16,
  },
  walletCard: {
    alignItems: 'center' as const,
    padding: 40,
    backgroundColor: colors.electricGreen,
  },
  walletTitle: {
    ...typography.brutalMedium,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
  walletText: {
    ...typography.body,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    marginTop: 16,
  },
  guestButton: {
    marginTop: 8,
  },
  screenTitle: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsCard: {
    padding: 20,
    backgroundColor: colors.muted,
  },
  statsTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsText: {
    ...typography.body,
    color: colors.foreground,
    marginBottom: 8,
  },
  quickActionsCard: {
    padding: 20,
    backgroundColor: colors.electricPurple,
  },
  actionsTitle: {
    ...typography.brutalSmall,
    color: colors.primaryForeground,
    marginBottom: 16,
    textAlign: 'center',
  },
  mapCard: {
    padding: 20,
    backgroundColor: colors.electricPurple,
    alignItems: 'center' as const,
  },
  mapText: {
    ...typography.body,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
  mapSubtext: {
    ...typography.bodySmall,
    color: colors.primaryForeground,
    textAlign: 'center',
  },
  starGrid: {
    padding: 20,
    backgroundColor: colors.muted,
  },
  gridTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  star: {
    fontSize: 40,
  },
  questCard: {
    padding: 20,
    backgroundColor: colors.electricGreen,
  },
  questTitle: {
    ...typography.brutalSmall,
    color: colors.primaryForeground,
    marginBottom: 8,
  },
  questText: {
    ...typography.body,
    color: colors.primaryForeground,
    marginBottom: 8,
  },
  questProgress: {
    ...typography.bodySmall,
    color: colors.primaryForeground,
    fontWeight: '600',
  },
  leaderboardCard: {
    padding: 20,
    backgroundColor: colors.electricOrange,
  },
  leaderboardTitle: {
    ...typography.brutalSmall,
    color: colors.primaryForeground,
    marginBottom: 16,
    textAlign: 'center',
  },
  rankText: {
    ...typography.body,
    color: colors.primaryForeground,
    marginBottom: 8,
  },
  profileCard: {
    padding: 20,
    backgroundColor: colors.muted,
    alignItems: 'center' as const,
  },
  profileTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 8,
  },
  profileText: {
    ...typography.body,
    color: colors.foreground,
    marginBottom: 4,
  },
  settingsCard: {
    padding: 20,
    backgroundColor: colors.background,
  },
  settingsTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderTopColor: colors.foreground,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: colors.mutedForeground,
  },
  activeTabIcon: {
    color: colors.primaryForeground,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: colors.primaryForeground,
  },
});