import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

const { width, height } = Dimensions.get('window');

export const LandingScreen: React.FC = () => {
  const { handleLandingComplete } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: '🌟',
      title: 'AR Star Collection',
      description: 'Discover and collect rare stars using augmented reality technology',
      color: colors.electricPurple,
    },
    {
      icon: '🎁',
      title: 'NFT Rewards',
      description: 'Earn exclusive NFTs for completing challenges and quests',
      color: colors.electricGreen,
    },
    {
      icon: '🏆',
      title: 'Global Leaderboard',
      description: 'Compete with players worldwide and climb the rankings',
      color: colors.electricOrange,
    },
    {
      icon: '⚔️',
      title: 'Epic Quests',
      description: 'Complete challenging quests and unlock new adventures',
      color: colors.electricPink,
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Players' },
    { number: '50K+', label: 'Stars Collected' },
    { number: '1K+', label: 'NFTs Minted' },
    { number: '100+', label: 'Cities Covered' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={[colors.electricPurple, colors.electricPink, colors.electricOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <Animated.View
          style={[
            styles.heroContent,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Text style={styles.heroTitle}>🌟 StarQuest AR</Text>
          <Text style={styles.heroSubtitle}>
            Your Cosmic Adventure Awaits
          </Text>
          <Text style={styles.heroDescription}>
            Discover, collect, and trade rare stars in augmented reality. 
            Join thousands of explorers in the ultimate space adventure!
          </Text>
        </Animated.View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Join the Community</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <NeoCard key={index} style={styles.statCard}>
              <Text style={styles.statNumber}>{stat.number}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </NeoCard>
          ))}
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>What Makes Us Special</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <NeoCard key={index} style={styles.featureCard}>
              <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </NeoCard>
          ))}
        </View>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          <NeoCard style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Connect Your Wallet</Text>
              <Text style={styles.stepDescription}>
                Link your MetaMask wallet to start your journey
              </Text>
            </View>
          </NeoCard>

          <NeoCard style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Explore the Map</Text>
              <Text style={styles.stepDescription}>
                Use AR to find and collect stars in your area
              </Text>
            </View>
          </NeoCard>

          <NeoCard style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn Rewards</Text>
              <Text style={styles.stepDescription}>
                Complete quests and earn exclusive NFTs
              </Text>
            </View>
          </NeoCard>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <NeoCard style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to Start Your Journey?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of explorers and start collecting stars today!
          </Text>
          <NeoButton
            title="Get Started Now"
            onPress={handleLandingComplete}
            variant="gradient"
            gradient={[colors.electricPurple, colors.electricPink]}
            size="large"
            style={styles.ctaButton}
          />
        </NeoCard>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with ❤️ for the cosmic community
        </Text>
        <Text style={styles.footerSubtext}>
          StarQuest AR • 2024
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    padding: 32,
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.7,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  heroTitle: {
    ...typography.brutalLarge,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  heroSubtitle: {
    ...typography.heading1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  heroDescription: {
    ...typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  statsSection: {
    padding: 20,
    backgroundColor: colors.muted,
  },
  sectionTitle: {
    ...typography.heading1,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: (width - 64) / 2,
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.foreground,
  },
  statNumber: {
    ...typography.brutalMedium,
    color: colors.electricPurple,
    marginBottom: 8,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontWeight: '600',
  },
  featuresSection: {
    padding: 20,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    padding: 24,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.foreground,
    boxShadow: '6px 6px 0px ' + colors.foreground,
    elevation: 8,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.foreground,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 8,
  },
  featureDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 22,
  },
  howItWorksSection: {
    padding: 20,
    backgroundColor: colors.muted,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.foreground,
  },
  stepNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.electricPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: colors.foreground,
  },
  stepNumberText: {
    ...typography.heading2,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 4,
  },
  stepDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  ctaSection: {
    padding: 20,
  },
  ctaCard: {
    padding: 32,
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.foreground,
    alignItems: 'center',
    boxShadow: '8px 8px 0px ' + colors.foreground,
    elevation: 12,
  },
  ctaTitle: {
    ...typography.heading1,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 16,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.muted,
  },
  footerText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
