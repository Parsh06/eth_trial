import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { MobileLayout } from '../components/layout/MobileLayout';

interface MathGameScreenProps {
  onGameComplete: (isWinner: boolean, score: number) => void;
  stakeAmount: string;
  targetName: string;
}

interface MathProblem {
  num1: number;
  num2: number;
  correctAnswer: number;
}

export const MathGameScreen: React.FC<MathGameScreenProps> = ({
  onGameComplete,
  stakeAmount = '0.01 ETH',
  targetName,
}) => {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per problem
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [timerAnim] = useState(new Animated.Value(1));

  // Generate a new math problem
  const generateProblem = (): MathProblem => {
    const num1 = Math.floor(Math.random() * 50) + 10; // 10-59
    const num2 = Math.floor(Math.random() * 50) + 10; // 10-59
    const correctAnswer = num1 + num2;
    
    console.log('🧮 MathGame: Generated problem:', `${num1} + ${num2} = ${correctAnswer}`);
    
    return { num1, num2, correctAnswer };
  };

  // Start the game
  const startGame = () => {
    console.log('🎮 MathGame: Starting game');
    setGameStarted(true);
    setCurrentProblem(generateProblem());
    setTimeLeft(30);
    setScore(0);
    setTotalQuestions(0);
    
    // Animate entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Timer effect
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          console.log('⏰ MathGame: Time up!');
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Timer animation effect
  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      // Pulse animation when time is running low
      Animated.sequence([
        Animated.timing(timerAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(timerAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeLeft, timerAnim]);

  // Handle time up
  const handleTimeUp = () => {
    console.log('⏰ MathGame: Time expired, game over');
    Alert.alert(
      '⏰ Time\'s Up!',
      'You ran out of time. Better luck next time!',
      [{ text: 'OK', onPress: () => onGameComplete(false, score) }]
    );
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!currentProblem || isSubmitting) return;
    
    setIsSubmitting(true);
    const answer = parseInt(userAnswer.trim());
    
    console.log('📝 MathGame: User answered:', answer, 'Correct answer:', currentProblem.correctAnswer);
    
    if (isNaN(answer)) {
      // Invalid input animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
      Alert.alert('Invalid Input', 'Please enter a valid number');
      setIsSubmitting(false);
      return;
    }

    const isCorrect = answer === currentProblem.correctAnswer;
    const newTotalQuestions = totalQuestions + 1;
    
    setTotalQuestions(newTotalQuestions);
    
    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      console.log('✅ MathGame: Correct answer! Score:', newScore);
      
      // Success - complete the game as winner
      setTimeout(() => {
        onGameComplete(true, newScore);
      }, 1000);
      
      Alert.alert(
        '🎉 Correct!',
        `Great job! You got it right.\nFinal Score: ${newScore}/${newTotalQuestions}`,
        [{ text: 'Claim Reward', onPress: () => onGameComplete(true, newScore) }]
      );
    } else {
      console.log('❌ MathGame: Wrong answer. Game over.');
      
      // Wrong answer animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 15, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -15, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 15, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
      
      setTimeout(() => {
        Alert.alert(
          '❌ Wrong Answer',
          `The correct answer was ${currentProblem.correctAnswer}.\nYou lose your stake. Better luck next time!`,
          [{ text: 'OK', onPress: () => onGameComplete(false, score) }]
        );
      }, 500);
    }
    
    setIsSubmitting(false);
  };

  // Handle key press
  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      submitAnswer();
    }
  };

  const getTimerColor = () => {
    if (timeLeft <= 5) return colors.error;
    if (timeLeft <= 10) return colors.warning;
    return colors.primary;
  };

  if (!gameStarted) {
    return (
      <MobileLayout>
        <View style={styles.container}>
          <NeoCard style={styles.welcomeCard}>
            <View style={styles.welcomeContent}>
              <Text style={styles.welcomeIcon}>🧮</Text>
              <Text style={styles.welcomeTitle}>Math Challenge</Text>
              <Text style={styles.welcomeMessage}>
                Welcome to the math challenge at {targetName}!
              </Text>
              
              <View style={styles.gameRules}>
                <Text style={styles.rulesTitle}>Game Rules:</Text>
                <Text style={styles.ruleItem}>• Solve the addition problem</Text>
                <Text style={styles.ruleItem}>• You have 30 seconds</Text>
                <Text style={styles.ruleItem}>• Correct answer wins double your stake</Text>
                <Text style={styles.ruleItem}>• Wrong answer loses your stake</Text>
              </View>
              
              <View style={styles.stakeInfo}>
                <Text style={styles.stakeLabel}>Your Stake: {stakeAmount}</Text>
                <Text style={styles.rewardLabel}>Potential Reward: 0.02 ETH</Text>
              </View>
              
              <NeoButton
                title="🚀 Start Game"
                onPress={startGame}
                variant="electric"
                size="large"
                style={styles.startButton}
              />
            </View>
          </NeoCard>
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.gameContent,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* Timer */}
            <View style={styles.timerContainer}>
              <Animated.Text
                style={[
                  styles.timerText,
                  {
                    color: getTimerColor(),
                    transform: [{ scale: timerAnim }],
                  },
                ]}
              >
                ⏰ {timeLeft}s
              </Animated.Text>
            </View>

            {/* Score */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>Score: {score}/{totalQuestions}</Text>
            </View>

            {/* Math Problem */}
            {currentProblem && (
              <NeoCard style={styles.problemCard}>
                <View style={styles.problemContent}>
                  <Text style={styles.problemTitle}>Solve this:</Text>
                  
                  <View style={styles.mathProblem}>
                    <Text style={styles.mathNumber}>{currentProblem.num1}</Text>
                    <Text style={styles.mathOperator}>+</Text>
                    <Text style={styles.mathNumber}>{currentProblem.num2}</Text>
                    <Text style={styles.mathEquals}>=</Text>
                    <Text style={styles.mathQuestion}>?</Text>
                  </View>
                  
                  <TextInput
                    style={styles.answerInput}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    placeholder="Enter your answer"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    autoFocus
                    onKeyPress={handleKeyPress}
                    editable={!isSubmitting}
                  />
                  
                  <NeoButton
                    title={isSubmitting ? "Checking..." : "✅ Submit Answer"}
                    onPress={submitAnswer}
                    variant="primary"
                    size="large"
                    style={styles.submitButton}
                    disabled={!userAnswer.trim() || isSubmitting}
                  />
                </View>
              </NeoCard>
            )}

            {/* Game Info */}
            <View style={styles.gameInfo}>
              <Text style={styles.gameInfoText}>
                💰 Stake: {stakeAmount} | 🎯 Target: {targetName}
              </Text>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  welcomeCard: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  welcomeTitle: {
    ...typography.heading1,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeMessage: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 32,
  },
  gameRules: {
    width: '100%',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  rulesTitle: {
    ...typography.heading4,
    color: colors.foreground,
    marginBottom: 12,
  },
  ruleItem: {
    ...typography.body,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  stakeInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stakeLabel: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardLabel: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  startButton: {
    width: '100%',
  },
  gameContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    ...typography.heading2,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreText: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  problemCard: {
    padding: 32,
    marginBottom: 24,
  },
  problemContent: {
    alignItems: 'center',
  },
  problemTitle: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 32,
  },
  mathProblem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 16,
  },
  mathNumber: {
    ...typography.heading1,
    color: colors.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  mathOperator: {
    ...typography.heading1,
    color: colors.foreground,
    fontSize: 40,
  },
  mathEquals: {
    ...typography.heading1,
    color: colors.foreground,
    fontSize: 40,
  },
  mathQuestion: {
    ...typography.heading1,
    color: colors.electricOrange,
    fontSize: 48,
    fontWeight: 'bold',
  },
  answerInput: {
    ...typography.heading2,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    color: colors.foreground,
    marginBottom: 24,
    minWidth: 120,
  },
  submitButton: {
    width: '100%',
  },
  gameInfo: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    padding: 12,
    borderRadius: 8,
  },
  gameInfoText: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
});
