import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NeoButton } from './ui/NeoButton';
import { NeoCard } from './ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

interface StarQuestion {
  id: number;
  name: string;
  description: string;
  question: string;
  answer: string;
  difficulty: string;
  reward: {
    name: string;
    rarity: string;
    points: number;
  };
}

interface QuestionModalProps {
  visible: boolean;
  onClose: () => void;
  starQuestion: StarQuestion | null;
  onAnswerSubmit: (isCorrect: boolean, starQuestion: StarQuestion) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  visible,
  onClose,
  starQuestion,
  onAnswerSubmit,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || !starQuestion) return;

    setIsSubmitting(true);

    // Check if the answer is correct (case-insensitive)
    const isCorrect = userAnswer.trim().toLowerCase() === starQuestion.answer.toLowerCase();

    setTimeout(() => {
      setIsSubmitting(false);
      
      if (isCorrect) {
        Alert.alert(
          '🎉 Correct!',
          `Well done! You earned ${starQuestion.reward.points} points!\\n\\nReward: ${starQuestion.reward.name}`,
          [
            {
              text: 'Collect Reward',
              onPress: () => {
                onAnswerSubmit(true, starQuestion);
                setUserAnswer('');
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ Incorrect',
          `That's not right. The correct answer was: ${starQuestion.answer}\\n\\nTry another star to test your knowledge!`,
          [
            {
              text: 'Try Again',
              onPress: () => setUserAnswer('')
            },
            {
              text: 'Close',
              onPress: () => {
                onAnswerSubmit(false, starQuestion);
                setUserAnswer('');
                onClose();
              }
            }
          ]
        );
      }
    }, 1000); // Small delay for better UX
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return colors.success;
      case 'intermediate':
        return colors.warning;
      case 'expert':
        return colors.error;
      default:
        return colors.mutedForeground;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return colors.mutedForeground;
      case 'rare':
        return colors.info;
      case 'epic':
        return colors.electricPurple;
      case 'legendary':
        return colors.electricOrange;
      default:
        return colors.mutedForeground;
    }
  };

  if (!starQuestion) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <NeoCard style={styles.questionCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.starName}>⭐ {starQuestion.name}</Text>
                  <Text style={styles.starDescription}>{starQuestion.description}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Star Info */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Difficulty</Text>
                  <Text style={[styles.infoValue, { color: getDifficultyColor(starQuestion.difficulty) }]}>
                    {starQuestion.difficulty.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Points</Text>
                  <Text style={styles.infoValue}>{starQuestion.reward.points}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Rarity</Text>
                  <Text style={[styles.infoValue, { color: getRarityColor(starQuestion.reward.rarity) }]}>
                    {starQuestion.reward.rarity.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Question */}
              <View style={styles.questionSection}>
                <Text style={styles.questionLabel}>Challenge Question:</Text>
                <Text style={styles.questionText}>{starQuestion.question}</Text>
              </View>

              {/* Answer Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Your Answer:</Text>
                <TextInput
                  style={styles.textInput}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Enter your answer here..."
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmitAnswer}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonSection}>
                <NeoButton
                  title={isSubmitting ? "Checking..." : "Submit Answer"}
                  onPress={handleSubmitAnswer}
                  variant="electric"
                  size="large"
                  disabled={!userAnswer.trim() || isSubmitting}
                  style={styles.submitButton}
                />
                
                <NeoButton
                  title="Cancel"
                  onPress={() => {
                    setUserAnswer('');
                    onClose();
                  }}
                  variant="outline"
                  size="medium"
                  style={styles.cancelButton}
                />
              </View>
            </NeoCard>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  questionCard: {
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flex: 1,
  },
  starName: {
    ...typography.brutalLarge,
    color: colors.foreground,
    marginBottom: 4,
  },
  starDescription: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  closeButton: {
    padding: 8,
    marginLeft: 16,
  },
  closeButtonText: {
    ...typography.brutalMedium,
    color: colors.mutedForeground,
    fontSize: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    ...typography.caption,
    color: colors.mutedForeground,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '700',
    fontSize: 12,
  },
  questionSection: {
    padding: 20,
    backgroundColor: colors.background,
  },
  questionLabel: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 12,
  },
  questionText: {
    ...typography.body,
    color: colors.foreground,
    lineHeight: 24,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  inputSection: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  inputLabel: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 12,
  },
  textInput: {
    ...typography.body,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    color: colors.foreground,
    minHeight: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSection: {
    padding: 20,
    gap: 12,
    backgroundColor: colors.background,
  },
  submitButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});
