import "node-libs-expo/globals";
import "react-native-url-polyfill/auto";
import 'react-native-get-random-values';
import React, { Suspense, lazy } from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { GameProvider, useGame } from "./src/context/GameContext";
import { WalletProvider } from "./src/context/WalletContext";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { Preloader } from "./src/components/Preloader";
import { BottomNav } from "./src/components/layout/BottomNav";
import { colors } from "./src/utils/colors";

// Direct imports - using real screens now
import { LandingScreen } from "./src/screens/LandingScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { QuestListScreen } from "./src/screens/QuestListScreen";
import { LeaderboardScreen } from "./src/screens/LeaderboardScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ChallengeScreen } from "./src/screens/ChallengeScreen";
import { RewardScreen } from "./src/screens/RewardScreen";


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

  // Loading fallback component
  const LoadingFallback = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  // Render screens based on state
  const renderScreen = () => {
    console.log('App.tsx: Rendering screen:', state.screen, 'activeTab:', state.screen === 'main' ? state.activeTab : 'N/A');
    switch (state.screen) {
      case "preloader":
        return <Preloader onComplete={handlePreloaderComplete} />;
      case "landing":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LandingScreen />
          </Suspense>
        );
      case "login":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LoginScreen />
          </Suspense>
        );
      case "onboarding":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <OnboardingScreen />
          </Suspense>
        );
      case "wallet-connect":
        return (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Wallet Connect Coming Soon</Text>
            <Text style={styles.loadingSubtext}>This feature is being optimized</Text>
          </View>
        );
      case "challenge":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ChallengeScreen />
          </Suspense>
        );
      case "reward":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <RewardScreen />
          </Suspense>
        );
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
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HomeScreen />
          </Suspense>
        );
      case "map":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MapScreen />
          </Suspense>
        );
      case "quests":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <QuestListScreen />
          </Suspense>
        );
      case "leaderboard":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LeaderboardScreen />
          </Suspense>
        );
      case "profile":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileScreen />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HomeScreen />
          </Suspense>
        );
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
    </View>
  );
};

// Main App component with WalletProvider
const App: React.FC = () => {

  // Add global error handler
  React.useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      console.log('🔴 GLOBAL ERROR CAUGHT:', ...args);
      originalConsoleError(...args);
    };

    const handleGlobalError = (error: any, isFatal?: boolean) => {
      console.log('😨 UNHANDLED ERROR:', error, 'isFatal:', isFatal);
      if (error?.message?.includes('ProfileScreen') || error?.stack?.includes('ProfileScreen')) {
        console.log('👤 ERROR RELATED TO PROFILESCREEN - PREVENTING APP RESTART!');
        // Don't treat ProfileScreen errors as fatal to prevent app restart
        return false;
      }
    };

    // @ts-ignore - React Native global error handler
    if (global.ErrorUtils) {
      global.ErrorUtils.setGlobalHandler(handleGlobalError);
    }

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <ErrorBoundary>
      <WalletProvider>
        <GameProvider>
          <AppContentWrapper />
        </GameProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
};

// Simple wrapper without wallet dependencies
const AppContentWrapper: React.FC = () => {
  return <AppContent />;
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