import React, { Suspense, lazy } from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { GameProvider, useGame } from "./src/context/GameContext";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { Preloader } from "./src/components/Preloader";
import { BottomNav } from "./src/components/layout/BottomNav";
import { colors } from "./src/utils/colors";

// Lazy load screens with named exports
const LandingScreen = lazy(() => import("./src/screens/LandingScreen").then(m => ({ default: m.LandingScreen })));
const LoginScreen = lazy(() => import("./src/screens/LoginScreen").then(m => ({ default: m.LoginScreen })));
const OnboardingScreen = lazy(() => import("./src/screens/OnboardingScreen").then(m => ({ default: m.OnboardingScreen })));
const HomeScreen = lazy(() => import("./src/screens/HomeScreen").then(m => ({ default: m.HomeScreen })));
const MapScreen = lazy(() => import("./src/screens/MapScreen").then(m => ({ default: m.MapScreen })));
const QuestListScreen = lazy(() => import("./src/screens/QuestListScreen").then(m => ({ default: m.QuestListScreen })));
const LeaderboardScreen = lazy(() => import("./src/screens/LeaderboardScreen").then(m => ({ default: m.LeaderboardScreen })));
const ProfileScreen = lazy(() => import("./src/screens/ProfileScreen").then(m => ({ default: m.ProfileScreen })));
const ChallengeScreen = lazy(() => import("./src/screens/ChallengeScreen").then(m => ({ default: m.ChallengeScreen })));
const RewardScreen = lazy(() => import("./src/screens/RewardScreen").then(m => ({ default: m.RewardScreen })));

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

// Main App component with conditional wallet providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContentWrapper />
      </GameProvider>
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