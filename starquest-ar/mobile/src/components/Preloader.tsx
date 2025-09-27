import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

const { width, height } = Dimensions.get('window');

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Continuous rotation for star
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // Star floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(starAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(starAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Text animation
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Complete after 3 seconds
      setTimeout(() => {
        onComplete();
      }, 3000);
    };

    startAnimations();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = starAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={[colors.electricPurple, colors.electricPink, colors.electricOrange]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Main Star Icon */}
        <Animated.View
          style={[
            styles.starContainer,
            {
              transform: [
                { rotate },
                { translateY },
              ],
            },
          ]}
        >
          <Text style={styles.starIcon}>🌟</Text>
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: textAnim,
              transform: [
                {
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>StarQuest AR</Text>
          <Text style={styles.subtitle}>Your Cosmic Adventure Awaits</Text>
        </Animated.View>

        {/* Loading Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Loading the universe...</Text>
        </View>

        {/* Floating Stars */}
        <View style={styles.floatingStars}>
          {[...Array(6)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.floatingStar,
                {
                  left: Math.random() * width,
                  top: Math.random() * height * 0.6 + height * 0.2,
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: starAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -30 - index * 5],
                      }),
                    },
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${360 + index * 60}deg`],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.floatingStarIcon}>⭐</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starContainer: {
    marginBottom: 40,
  },
  starIcon: {
    fontSize: 80,
    textShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    ...typography.brutalLarge,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    ...typography.subheading,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  progressContainer: {
    width: width * 0.6,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    boxShadow: '0px 0px 4px rgba(255, 255, 255, 0.8)',
    elevation: 4,
  },
  loadingText: {
    ...typography.body,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  floatingStars: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  floatingStar: {
    position: 'absolute',
  },
  floatingStarIcon: {
    fontSize: 20,
    opacity: 0.7,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
});
