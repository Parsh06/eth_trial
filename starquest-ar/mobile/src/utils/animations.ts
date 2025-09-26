import { Animated } from 'react-native';

export const animations = {
  // Bounce Brutal Animation
  bounceBrutal: {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  },
  
  // Star Pulse Animation
  starPulse: {
    toValue: 1.2,
    duration: 1000,
    useNativeDriver: true,
  },
  
  // Slide In Animation
  slideIn: {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  },
  
  // Fade In Animation
  fadeIn: {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  },
} as const;

export const createBounceAnimation = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.1,
      duration: 150,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }),
  ]);
};

export const createPulseAnimation = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ])
  );
};
