import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoCard } from '../components/ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { Challenge } from '../types';

export const ChallengeScreen: React.FC = () => {
  const { challenges, handleChallengeComplete, handleQRScan } = useGame();
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Get the first available challenge
    const challenge = challenges.find(c => !c.completed);
    if (challenge) {
      setCurrentChallenge(challenge);
      setTimeLeft(challenge.timeLimit || 60);
    }
  }, [challenges]);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCompleted) {
      handleTimeUp();
    }
  }, [timeLeft, isCompleted]);

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      'You didn\'t complete the challenge in time. Try again!',
      [
        { text: 'Try Again', onPress: () => setTimeLeft(currentChallenge?.timeLimit || 60) },
        { text: 'Give Up', onPress: () => handleChallengeComplete(false) },
      ]
    );
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!currentChallenge || !selectedAnswer) return;

    const isCorrect = selectedAnswer === currentChallenge.correctAnswer;
    
    if (isCorrect) {
      setIsCompleted(true);
      Alert.alert(
        'Correct! 🎉',
        'Great job! You\'ve completed the challenge.',
        [
          { 
            text: 'Claim Reward', 
            onPress: () => handleChallengeComplete(true) 
          }
        ]
      );
    } else {
      Alert.alert(
        'Incorrect',
        'That\'s not the right answer. Try again!',
        [{ text: 'Try Again' }]
      );
    }
  };

  const handleUseHint = () => {
    setShowHint(true);
    Alert.alert('Hint', currentChallenge?.hint || 'No hint available');
  };

  const handleQRScanPress = () => {
    Alert.alert(
      'QR Scanner',
      'Point your camera at a QR code to scan it',
      [
        { text: 'Cancel' },
        { 
          text: 'Scan', 
          onPress: () => {
            // Simulate QR scan
            const mockQRData = 'starquest://challenge/complete';
            handleQRScan(mockQRData);
            handleChallengeComplete(true);
          }
        }
      ]
    );
  };

  if (!currentChallenge) {
    return (
      <MobileLayout>
        <View style={styles.container}>
          <NeoCard style={styles.noChallengeCard}>
            <Text style={styles.noChallengeTitle}>No Challenges Available</Text>
            <Text style={styles.noChallengeDescription}>
              Complete more stars to unlock new challenges!
            </Text>
          </NeoCard>
        </View>
      </MobileLayout>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MobileLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Challenge Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{currentChallenge.title}</Text>
          <Text style={styles.description}>{currentChallenge.description}</Text>
        </View>

        {/* Timer */}
        {timeLeft > 0 && (
          <NeoCard style={[styles.timerCard, { 
            backgroundColor: timeLeft < 10 ? colors.error : colors.warning 
          }]}>
            <Text style={styles.timerText}>
              ⏰ {formatTime(timeLeft)}
            </Text>
          </NeoCard>
        )}

        {/* Challenge Content */}
        <NeoCard style={styles.challengeCard}>
          {currentChallenge.type === 'trivia' && (
            <>
              <Text style={styles.question}>{currentChallenge.question}</Text>
              
              <View style={styles.optionsContainer}>
                {currentChallenge.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedAnswer === option && styles.selectedOption,
                    ]}
                    onPress={() => handleAnswerSelect(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === option && styles.selectedOptionText,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {currentChallenge.type === 'ar' && (
            <View style={styles.arContainer}>
              <Text style={styles.arTitle}>AR Challenge</Text>
              <Text style={styles.arDescription}>
                Use your camera to scan the QR code and complete the challenge
              </Text>
              <NeoButton
                title="Open Camera"
                onPress={handleQRScanPress}
                variant="electric"
                size="lg"
                style={styles.cameraButton}
              />
            </View>
          )}

          {currentChallenge.type === 'creative' && (
            <View style={styles.creativeContainer}>
              <Text style={styles.creativeTitle}>Creative Challenge</Text>
              <Text style={styles.creativeDescription}>
                Take a photo or create something that represents the theme: "Space Adventure"
              </Text>
              <NeoButton
                title="Submit Photo"
                onPress={() => handleChallengeComplete(true)}
                variant="electric"
                size="lg"
                style={styles.submitButton}
              />
            </View>
          )}

          {currentChallenge.type === 'puzzle' && (
            <View style={styles.puzzleContainer}>
              <Text style={styles.puzzleTitle}>Puzzle Challenge</Text>
              <Text style={styles.puzzleDescription}>
                Solve this sequence: 2, 4, 8, 16, ?
              </Text>
              <NeoButton
                title="Answer: 32"
                onPress={() => handleChallengeComplete(true)}
                variant="electric"
                size="lg"
                style={styles.submitButton}
              />
            </View>
          )}
        </NeoCard>

        {/* Hint Section */}
        {currentChallenge.hint && !showHint && (
          <NeoButton
            title="💡 Use Hint"
            onPress={handleUseHint}
            variant="outline"
            style={styles.hintButton}
          />
        )}

        {showHint && currentChallenge.hint && (
          <NeoCard style={styles.hintCard}>
            <Text style={styles.hintTitle}>💡 Hint</Text>
            <Text style={styles.hintText}>{currentChallenge.hint}</Text>
          </NeoCard>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {currentChallenge.type === 'trivia' && (
            <NeoButton
              title="Submit Answer"
              onPress={handleSubmitAnswer}
              variant="electric"
              size="lg"
              disabled={!selectedAnswer}
              style={styles.submitButton}
            />
          )}

          <NeoButton
            title="Give Up"
            onPress={() => handleChallengeComplete(false)}
            variant="outline"
            style={styles.giveUpButton}
          />
        </View>
      </ScrollView>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  timerCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    ...typography.brutalMedium,
    color: colors.primaryForeground,
  },
  challengeCard: {
    marginBottom: 24,
  },
  question: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.foreground,
    backgroundColor: colors.background,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    ...typography.body,
    color: colors.foreground,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: colors.primaryForeground,
  },
  arContainer: {
    alignItems: 'center',
    padding: 20,
  },
  arTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 16,
  },
  arDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
  cameraButton: {
    marginTop: 8,
  },
  creativeContainer: {
    alignItems: 'center',
    padding: 20,
  },
  creativeTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 16,
  },
  creativeDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
  puzzleContainer: {
    alignItems: 'center',
    padding: 20,
  },
  puzzleTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 16,
  },
  puzzleDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
  hintButton: {
    marginBottom: 16,
  },
  hintCard: {
    backgroundColor: colors.warning,
    marginBottom: 16,
  },
  hintTitle: {
    ...typography.brutalSmall,
    color: colors.primaryForeground,
    marginBottom: 8,
  },
  hintText: {
    ...typography.body,
    color: colors.primaryForeground,
  },
  actionContainer: {
    gap: 12,
    marginBottom: 24,
  },
  giveUpButton: {
    marginTop: 8,
  },
  noChallengeCard: {
    alignItems: 'center',
    padding: 40,
  },
  noChallengeTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 16,
  },
  noChallengeDescription: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
