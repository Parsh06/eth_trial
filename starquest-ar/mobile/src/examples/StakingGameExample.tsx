import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { MobileLayout } from '../components/layout/MobileLayout';
import { starQuestWeb3Service } from '../services/StarQuestWeb3Service';
import { gameCompletionService, GameResult } from '../services/GameCompletionService';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

interface StakingGameExampleProps {
  privateKey: string;
  starId: number;
  stakeAmount: string;
}

export const StakingGameExample: React.FC<StakingGameExampleProps> = ({
  privateKey,
  starId,
  stakeAmount
}) => {
  const [gameState, setGameState] = useState<'idle' | 'staking' | 'playing' | 'completed'>('idle');
  const [stakingResult, setStakingResult] = useState<any>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      // Connect wallet
      const connected = await starQuestWeb3Service.connectWallet(privateKey);
      if (!connected) {
        Alert.alert('Error', 'Failed to connect wallet');
        return;
      }

      // Get player stats and balance
      const [stats, walletBalance] = await Promise.all([
        starQuestWeb3Service.getPlayerStats(),
        starQuestWeb3Service.getBalance()
      ]);

      setPlayerStats(stats);
      setBalance(walletBalance);

      console.log('✅ Game initialized');
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      Alert.alert('Error', 'Failed to initialize game');
    }
  };

  const handleStartStaking = async () => {
    try {
      setGameState('staking');
      
      console.log('💰 Starting staking process...');
      const result = await starQuestWeb3Service.createStake(starId, stakeAmount);
      
      if (result.success) {
        setStakingResult(result);
        setGameState('playing');
        console.log('✅ Staking successful!');
      } else {
        Alert.alert('Staking Failed', result.error || 'Unknown error');
        setGameState('idle');
      }
    } catch (error: any) {
      console.error('❌ Staking failed:', error);
      Alert.alert('Staking Failed', error.message);
      setGameState('idle');
    }
  };

  const handlePlayGame = () => {
    // Simulate playing the game
    Alert.alert(
      'Math Challenge',
      'What is 15 + 27?',
      [
        {
          text: '42 (Correct)',
          onPress: () => handleGameResult(true)
        },
        {
          text: '41 (Wrong)',
          onPress: () => handleGameResult(false)
        }
      ]
    );
  };

  const handleGameResult = async (gameSuccess: boolean) => {
    try {
      console.log(`🎯 Game result: ${gameSuccess ? 'Won' : 'Lost'}`);
      
      if (stakingResult?.challengeId) {
        const result = await gameCompletionService.completeChallenge(
          stakingResult.challengeId,
          gameSuccess
        );
        
        setGameResult(result);
        setGameState('completed');
        
        if (result.success) {
          Alert.alert(
            '🎉 Congratulations!',
            `You won! Payout: ${result.payout} HBAR`
          );
        } else {
          Alert.alert(
            '😔 Game Over',
            'You lost your stake. Better luck next time!'
          );
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to complete game:', error);
      Alert.alert('Error', 'Failed to complete game');
    }
  };

  const handleReset = () => {
    setGameState('idle');
    setStakingResult(null);
    setGameResult(null);
  };

  const renderIdleState = () => (
    <NeoCard style={styles.card}>
      <Text style={styles.title}>🎮 StarQuest Staking Game</Text>
      <Text style={styles.subtitle}>Ready to stake and play?</Text>
      
      <View style={styles.gameInfo}>
        <Text style={styles.infoLabel}>Stake Amount:</Text>
        <Text style={styles.infoValue}>{stakeAmount} HBAR</Text>
        
        <Text style={styles.infoLabel}>Star ID:</Text>
        <Text style={styles.infoValue}>#{starId}</Text>
        
        <Text style={styles.infoLabel}>Your Balance:</Text>
        <Text style={styles.infoValue}>{balance} HBAR</Text>
      </View>

      {playerStats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Stats:</Text>
          <Text style={styles.statsText}>Wins: {playerStats.challengesCompleted}</Text>
          <Text style={styles.statsText}>Losses: {playerStats.challengesFailed}</Text>
          <Text style={styles.statsText}>Current Streak: {playerStats.currentStreak}</Text>
        </View>
      )}

      <NeoButton
        title="💰 Start Staking"
        onPress={handleStartStaking}
        variant="electric"
        size="large"
        style={styles.button}
      />
    </NeoCard>
  );

  const renderStakingState = () => (
    <NeoCard style={styles.card}>
      <Text style={styles.title}>⏳ Processing Stake...</Text>
      <Text style={styles.subtitle}>Please wait while we process your stake</Text>
    </NeoCard>
  );

  const renderPlayingState = () => (
    <NeoCard style={styles.card}>
      <Text style={styles.title}>🎯 Challenge Active!</Text>
      <Text style={styles.subtitle}>Your stake is locked. Time to play!</Text>
      
      <View style={styles.stakeInfo}>
        <Text style={styles.infoLabel}>Challenge ID:</Text>
        <Text style={styles.infoValue}>#{stakingResult?.challengeId}</Text>
        
        <Text style={styles.infoLabel}>Transaction:</Text>
        <Text style={styles.infoValue}>
          {stakingResult?.transactionHash?.slice(0, 10)}...
        </Text>
      </View>

      <NeoButton
        title="🧮 Start Math Challenge"
        onPress={handlePlayGame}
        variant="electric"
        size="large"
        style={styles.button}
      />
    </NeoCard>
  );

  const renderCompletedState = () => (
    <NeoCard style={styles.card}>
      <Text style={styles.title}>
        {gameResult?.success ? '🎉 You Won!' : '😔 You Lost'}
      </Text>
      <Text style={styles.subtitle}>
        {gameResult?.success 
          ? `Payout: ${gameResult.payout} HBAR` 
          : 'Your stake has been forfeited'
        }
      </Text>
      
      {gameResult?.transactionHash && (
        <View style={styles.resultInfo}>
          <Text style={styles.infoLabel}>Result Transaction:</Text>
          <Text style={styles.infoValue}>
            {gameResult.transactionHash.slice(0, 10)}...
          </Text>
        </View>
      )}

      <NeoButton
        title="🔄 Play Again"
        onPress={handleReset}
        variant="electric"
        size="large"
        style={styles.button}
      />
    </NeoCard>
  );

  return (
    <MobileLayout>
      <View style={styles.container}>
        {gameState === 'idle' && renderIdleState()}
        {gameState === 'staking' && renderStakingState()}
        {gameState === 'playing' && renderPlayingState()}
        {gameState === 'completed' && renderCompletedState()}
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
  card: {
    padding: 32,
  },
  title: {
    ...typography.heading1,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 32,
  },
  gameInfo: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  infoValue: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsContainer: {
    backgroundColor: colors.info + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  statsTitle: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsText: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  stakeInfo: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  resultInfo: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  button: {
    width: '100%',
  },
});

export default StakingGameExample;
