import './src/polyfills';
import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppKit } from "@reown/appkit-wagmi-react-native";
import { wagmiConfig, queryClient } from "./src/config/wagmi";
import { GameProvider, useGame } from "./src/context/GameContext";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { Preloader } from "./src/components/Preloader";
import { LandingScreen } from "./src/screens/LandingScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { WalletConnectScreen } from "./src/screens/WalletConnectScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { QuestListScreen } from "./src/screens/QuestListScreen";
import { LeaderboardScreen } from "./src/screens/LeaderboardScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ChallengeScreen } from "./src/screens/ChallengeScreen";
import { RewardScreen } from "./src/screens/RewardScreen";
import { BottomNav } from "./src/components/layout/BottomNav";
import { colors } from "./src/utils/colors";

// Main App component with GameProvider
const AppContent: React.FC = () => {
  const { state, loading, error, handleTabChange, handlePreloaderComplete, handleLandingComplete } = useGame();

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading StarQuest AR...</Text>
        <Text style={styles.loadingSubtext}>Preparing your cosmic adventure</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
  return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <Text style={styles.errorHint}>Please try restarting the app</Text>
    </View>
  );
  }

  // Render screens based on state
  const renderScreen = () => {
    console.log('App.tsx: Rendering screen:', state.screen, 'activeTab:', state.screen === 'main' ? state.activeTab : 'N/A');
    switch (state.screen) {
      case "preloader":
        return <Preloader onComplete={handlePreloaderComplete} />;
      case "landing":
        return <LandingScreen />;
      case "login":
        return <LoginScreen />;
      case "onboarding":
        return <OnboardingScreen />;
      case "wallet-connect":
        return <WalletConnectScreen />;
      case "challenge":
        return <ChallengeScreen />;
      case "reward":
        return <RewardScreen />;
      case "main":
        return renderMainScreen();
      default:
        return <Preloader onComplete={handlePreloaderComplete} />;
    }
  };

  // Render main app screens with navigation
  const renderMainScreen = () => {
    const activeTab = state.screen === "main" ? state.activeTab : "home";
    
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "map":
        return <MapScreen />;
      case "quests":
        return <QuestListScreen />;
      case "leaderboard":
        return <LeaderboardScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  // Navigation tabs
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "map", label: "Map", icon: "🗺️" },
    { id: "quests", label: "Quests", icon: "⚔️" },
    { id: "leaderboard", label: "Rankings", icon: "🏆" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {renderScreen()}
      {state.screen === "main" && (
        <BottomNav
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
          tabs={tabs}
        />
      )}
      <AppKit />
    </View>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.electricPurple,
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.error,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginBottom: 16,
    textAlign: "center",
  },
  errorHint: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default App;