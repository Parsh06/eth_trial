import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to StarQuest AR',
    description: 'Discover hidden stars in the real world and collect amazing NFT rewards!',
    icon: '⭐',
    color: colors.electricPurple,
  },
  {
    id: 2,
    title: 'How to Play',
    description: 'Use your camera to find stars, complete AI-powered challenges, and earn unique NFTs.',
    icon: '⚡',
    color: colors.electricGreen,
  },
  {
    id: 3,
    title: 'Connect Your Wallet',
    description: 'Link your Web3 wallet to start collecting NFTs and join the leaderboard.',
    icon: '👛',
    color: colors.electricOrange,
  },
];

export const OnboardingScreen: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { handleOnboardingComplete } = useGame();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleOnboardingComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <MobileLayout>
      <View style={styles.container}>
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentSlide && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Slide Content */}
        <ScrollView
          style={styles.slideContainer}
          showsVerticalScrollIndicator={false}
        >
          <NeoCard
            variant="electric"
            style={[styles.slideCard, { backgroundColor: currentSlideData.color }]}
          >
            <Text style={styles.slideIcon}>{currentSlideData.icon}</Text>
            <Text style={styles.slideTitle}>{currentSlideData.title}</Text>
            <Text style={styles.slideDescription}>
              {currentSlideData.description}
            </Text>
          </NeoCard>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <NeoButton
            title="Previous"
            onPress={handlePrevious}
            variant="outline"
            disabled={currentSlide === 0}
            style={styles.navButton}
          />
          <NeoButton
            title={currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            variant="electric"
            style={styles.navButton}
          />
        </View>
      </View>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.muted,
    borderWidth: 2,
    borderColor: colors.foreground,
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  slideContainer: {
    flex: 1,
  },
  slideCard: {
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
    justifyContent: 'center',
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  slideTitle: {
    ...typography.brutalLarge,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: 20,
  },
  slideDescription: {
    ...typography.body,
    color: colors.primaryForeground,
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  navButton: {
    flex: 1,
  },
});
