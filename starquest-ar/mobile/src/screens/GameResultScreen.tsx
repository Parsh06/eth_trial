import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { MobileLayout } from '../components/layout/MobileLayout';

const { width } = Dimensions.get('window');

interface GameResultScreenProps {
  isWinner: boolean;
  score: number;
  stakeAmount: string;
  rewardAmount: string;
  targetName: string;
  onBackToMap: () => void;
  onPlayAgain?: () => void;
}

export const GameResultScreen: React.FC<GameResultScreenProps> = ({
  isWinner,
  score,
  stakeAmount = '0.01 ETH',
  rewardAmount = '0.02 ETH',
  targetName,
  onBackToMap,
  onPlayAgain,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log(`🎮 GameResult: Showing ${isWinner ? 'winner' : 'loser'} screen`);
    
    if (isWinner) {
      // Winner animations
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous celebration rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Bounce effect
      const bounce = () => {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(bounce, 1000);
        });
      };
      setTimeout(bounce, 1000);
    } else {
      // Loser animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }
  }, [isWinner, scaleAnim, rotateAnim, bounceAnim, confettiAnim]);

  const handleBackToMap = () => {
    console.log('🗺️ GameResult: Returning to map');
    onBackToMap();
  };

  const handlePlayAgain = () => {
    if (onPlayAgain) {
      console.log('🔄 GameResult: Playing again');
      onPlayAgain();
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounceInterpolate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <MobileLayout>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {isWinner ? (
            <NeoCard style={[styles.card, styles.winnerCard]}>
              <View style={styles.cardContent}>
                {/* Confetti Effect */}
                <Animated.View
                  style={[
                    styles.confetti,
                    {
                      opacity: confettiAnim,
                      transform: [
                        {
                          translateY: confettiAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.confettiText}>🎉 🎊 ✨ 🎉 🎊</Text>
                </Animated.View>

                {/* Winner Icon */}
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [
                        { rotate: rotateInterpolate },
                        { scale: bounceInterpolate },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.winnerIcon}>🏆</Text>
                </Animated.View>

                <Text style={styles.winnerTitle}>CONGRATULATIONS!</Text>
                <Text style={styles.winnerSubtitle}>You Won!</Text>

                <View style={styles.scoreSection}>
                  <Text style={styles.scoreLabel}>Final Score</Text>
                  <Text style={styles.scoreValue}>{score}/1</Text>
                </View>

                <View style={styles.rewardSection}>
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardLabel}>Your Stake:</Text>
                    <Text style={styles.stakeValue}>{stakeAmount}</Text>
                  </View>
                  <View style={styles.rewardRow}>
                    <Text style={styles.rewardLabel}>Reward Won:</Text>
                    <Text style={styles.rewardValue}>{rewardAmount}</Text>
                  </View>
                  <View style={[styles.rewardRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total Earned:</Text>
                    <Text style={styles.totalValue}>{rewardAmount}</Text>
                  </View>
                </View>

                <View style={styles.achievementBox}>
                  <Text style={styles.achievementIcon}>🎯</Text>
                  <Text style={styles.achievementText}>
                    Perfect math skills! You've doubled your stake at {targetName}.
                  </Text>
                </View>

                <View style={styles.actions}>
                  <NeoButton
                    title="🗺️ Back to Map"
                    onPress={handleBackToMap}
                    variant="primary"
                    size="large"
                    style={styles.primaryButton}
                  />
                  {onPlayAgain && (
                    <NeoButton
                      title="🎮 Play Again"
                      onPress={handlePlayAgain}
                      variant="electric"
                      size="large"
                      style={styles.secondaryButton}
                    />
                  )}
                </View>
              </View>
            </NeoCard>
          ) : (
            <NeoCard style={[styles.card, styles.loserCard]}>
              <View style={styles.cardContent}>
                {/* Loser Icon */}
                <View style={styles.iconContainer}>
                  <Text style={styles.loserIcon}>💸</Text>
                </View>

                <Text style={styles.loserTitle}>Game Over</Text>
                <Text style={styles.loserSubtitle}>Better luck next time!</Text>

                <View style={styles.scoreSection}>
                  <Text style={styles.scoreLabel}>Final Score</Text>
                  <Text style={styles.scoreValue}>{score}/1</Text>
                </View>

                <View style={styles.lossSection}>
                  <View style={styles.lossRow}>
                    <Text style={styles.lossLabel}>Stake Lost:</Text>
                    <Text style={styles.lossValue}>-{stakeAmount}</Text>
                  </View>
                  <View style={styles.lossRow}>
                    <Text style={styles.lossLabel}>Location:</Text>
                    <Text style={styles.locationValue}>{targetName}</Text>
                  </View>
                </View>

                <View style={styles.encouragementBox}>
                  <Text style={styles.encouragementIcon}>💪</Text>
                  <Text style={styles.encouragementText}>
                    Don't give up! Practice makes perfect. 
                    Try again when you find another challenge location.
                  </Text>
                </View>

                <View style={styles.actions}>
                  <NeoButton
                    title="🗺️ Back to Map"
                    onPress={handleBackToMap}
                    variant="primary"
                    size="large"
                    style={styles.primaryButton}
                  />
                  {onPlayAgain && (
                    <NeoButton
                      title="🔄 Try Again"
                      onPress={handlePlayAgain}
                      variant="outline"
                      size="large"
                      style={styles.secondaryButton}
                    />
                  )}
                </View>
              </View>
            </NeoCard>
          )}
        </Animated.View>
      </View>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: 32,
  },
  winnerCard: {
    borderColor: colors.success,
    borderWidth: 3,
    backgroundColor: colors.success + '10',
  },
  loserCard: {
    borderColor: colors.error,
    borderWidth: 3,
    backgroundColor: colors.error + '10',
  },
  cardContent: {
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: -20,
    width: '100%',
    alignItems: 'center',
  },
  confettiText: {
    fontSize: 24,
    letterSpacing: 8,
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  winnerIcon: {
    fontSize: 100,
  },
  loserIcon: {
    fontSize: 80,
  },
  winnerTitle: {
    ...typography.heading1,
    color: colors.success,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  winnerSubtitle: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 32,
    textAlign: 'center',
  },
  loserTitle: {
    ...typography.heading1,
    color: colors.error,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loserSubtitle: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 32,
    textAlign: 'center',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    width: '100%',
  },
  scoreLabel: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  scoreValue: {
    ...typography.heading2,
    color: colors.foreground,
    fontWeight: 'bold',
  },
  rewardSection: {
    width: '100%',
    backgroundColor: colors.success + '20',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.success,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: colors.success,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  rewardLabel: {
    ...typography.body,
    color: colors.foreground,
  },
  stakeValue: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '600',
  },
  rewardValue: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  totalLabel: {
    ...typography.heading4,
    color: colors.foreground,
    fontWeight: 'bold',
  },
  totalValue: {
    ...typography.heading4,
    color: colors.success,
    fontWeight: 'bold',
  },
  lossSection: {
    width: '100%',
    backgroundColor: colors.error + '20',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.error,
  },
  lossRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lossLabel: {
    ...typography.body,
    color: colors.foreground,
  },
  lossValue: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  locationValue: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
  },
  achievementBox: {
    flexDirection: 'row',
    backgroundColor: colors.success + '30',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    width: '100%',
  },
  achievementIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  achievementText: {
    ...typography.body,
    color: colors.foreground,
    flex: 1,
    lineHeight: 20,
  },
  encouragementBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '30',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    width: '100%',
  },
  encouragementIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  encouragementText: {
    ...typography.body,
    color: colors.foreground,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
