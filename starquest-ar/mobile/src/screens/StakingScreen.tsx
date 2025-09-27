import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { MobileLayout } from '../components/layout/MobileLayout';

interface StakingScreenProps {
  onStakingComplete: () => void;
  stakeAmount: string;
  targetName: string;
}

export const StakingScreen: React.FC<StakingScreenProps> = ({
  onStakingComplete,
  stakeAmount = '0.01 ETH',
  targetName,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log('💰 StakingScreen: Starting staking process for', stakeAmount);
    
    // Animate entrance
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate staking process
    const stakingProcess = async () => {
      // Progress animation
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // Simulate network delay and processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('💰 StakingScreen: Processing payment...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('💰 StakingScreen: Confirming transaction...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ StakingScreen: Staking successful!');
      
      setIsProcessing(false);
      setIsSuccess(true);
    };

    stakingProcess();
  }, [progress, scaleAnim, opacityAnim, stakeAmount]);

  const handleContinueToGame = () => {
    console.log('🎮 StakingScreen: Proceeding to game');
    onStakingComplete();
  };

  return (
    <MobileLayout>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {isProcessing ? (
            <NeoCard style={styles.processingCard}>
              <View style={styles.processingContent}>
                <View style={styles.iconContainer}>
                  <Text style={styles.processingIcon}>💰</Text>
                  <ActivityIndicator 
                    size="large" 
                    color={colors.primary} 
                    style={styles.spinner}
                  />
                </View>
                
                <Text style={styles.processingTitle}>Processing Stake</Text>
                <Text style={styles.processingSubtitle}>
                  Staking {stakeAmount} for {targetName}
                </Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                </View>
                
                <View style={styles.processingSteps}>
                  <Text style={styles.stepText}>📝 Preparing transaction...</Text>
                  <Text style={styles.stepText}>🔗 Connecting to blockchain...</Text>
                  <Text style={styles.stepText}>✅ Confirming stake...</Text>
                </View>
              </View>
            </NeoCard>
          ) : (
            <NeoCard style={styles.successCard}>
              <View style={styles.successContent}>
                <View style={styles.successIconContainer}>
                  <Text style={styles.successIcon}>🎉</Text>
                </View>
                
                <Text style={styles.successTitle}>Stake Successful!</Text>
                <Text style={styles.successMessage}>
                  You've successfully staked {stakeAmount} for the math challenge at {targetName}.
                </Text>
                
                <View style={styles.stakeDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Staked Amount:</Text>
                    <Text style={styles.detailValue}>{stakeAmount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Potential Reward:</Text>
                    <Text style={styles.rewardValue}>0.02 ETH</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Game Type:</Text>
                    <Text style={styles.detailValue}>Math Challenge</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>{targetName}</Text>
                  </View>
                </View>
                
                <View style={styles.gameInfo}>
                  <Text style={styles.gameInfoIcon}>🧮</Text>
                  <Text style={styles.gameInfoText}>
                    Get ready for a quick math challenge! 
                    Answer correctly to win double your stake.
                  </Text>
                </View>
                
                <NeoButton
                  title="🎮 Start Math Game"
                  onPress={handleContinueToGame}
                  variant="electric"
                  size="large"
                  style={styles.continueButton}
                />
                
                <Text style={styles.disclaimer}>
                  Good luck! Remember, you'll lose your stake if you answer incorrectly.
                </Text>
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
  processingCard: {
    padding: 32,
  },
  processingContent: {
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  processingIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  spinner: {
    position: 'absolute',
    top: 50,
    left: 50,
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  processingTitle: {
    ...typography.heading2,
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  processingSubtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  processingSteps: {
    alignItems: 'center',
    gap: 8,
  },
  stepText: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
  successCard: {
    padding: 32,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  successTitle: {
    ...typography.heading1,
    color: colors.success,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.body,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  stakeDetails: {
    width: '100%',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  detailValue: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
  },
  rewardValue: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  gameInfo: {
    flexDirection: 'row',
    backgroundColor: colors.info + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  gameInfoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  gameInfoText: {
    ...typography.body,
    color: colors.foreground,
    flex: 1,
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
    marginBottom: 16,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
