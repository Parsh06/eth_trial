import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { NeoButton } from './ui/NeoButton';
import { NeoCard } from './ui/NeoCard';
import { ProximityTarget } from '../services/ProximityService';

const { width, height } = Dimensions.get('window');

interface GameInvitationPopupProps {
  visible: boolean;
  target: ProximityTarget | null;
  distance: number;
  onStakeToPlay: () => void;
  onIgnore: () => void;
  onClose: () => void;
}

export const GameInvitationPopup: React.FC<GameInvitationPopupProps> = ({
  visible,
  target,
  distance,
  onStakeToPlay,
  onIgnore,
  onClose,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      console.log('🎮 GameInvitationPopup: Showing popup for target:', target?.name);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim, target?.name]);

  const handleStakeToPlay = () => {
    console.log('💰 GameInvitationPopup: User chose to stake and play');
    onStakeToPlay();
  };

  const handleIgnore = () => {
    console.log('🚫 GameInvitationPopup: User chose to ignore');
    onIgnore();
  };

  if (!target) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: opacityAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.popupContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <NeoCard style={styles.popup}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerIcon}>🎮</Text>
                  <Text style={styles.title}>Game Challenge!</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={onClose}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Location Info */}
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{target.name}</Text>
                  <Text style={styles.distanceText}>
                    📍 You're {distance.toFixed(1)}m away
                  </Text>
                </View>

                {/* Game Description */}
                <View style={styles.gameDescription}>
                  <Text style={styles.descriptionTitle}>Math Challenge</Text>
                  <Text style={styles.descriptionText}>
                    Test your math skills in a quick addition game! 
                    Answer correctly to win rewards.
                  </Text>
                </View>

                {/* Stake Info */}
                <View style={styles.stakeInfo}>
                  <View style={styles.stakeRow}>
                    <Text style={styles.stakeLabel}>Entry Fee:</Text>
                    <Text style={styles.stakeAmount}>0.01 ETH</Text>
                  </View>
                  <View style={styles.stakeRow}>
                    <Text style={styles.stakeLabel}>Potential Reward:</Text>
                    <Text style={styles.rewardAmount}>0.02 ETH</Text>
                  </View>
                </View>

                {/* Warning */}
                <View style={styles.warningBox}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>
                    By staking, you agree to risk your entry fee. 
                    Win to double your stake!
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <NeoButton
                    title="💰 Stake to Play"
                    onPress={handleStakeToPlay}
                    variant="electric"
                    size="large"
                    style={styles.stakeButton}
                  />
                  
                  <NeoButton
                    title="🚫 Ignore"
                    onPress={handleIgnore}
                    variant="outline"
                    size="large"
                    style={styles.ignoreButton}
                  />
                </View>

                {/* Proximity Indicator */}
                <View style={styles.proximityIndicator}>
                  <View style={[
                    styles.proximityDot,
                    { backgroundColor: distance <= 1.5 ? colors.success : colors.warning }
                  ]} />
                  <Text style={styles.proximityText}>
                    {distance <= 1.5 ? 'Perfect range!' : 'Move closer for better connection'}
                  </Text>
                </View>
              </NeoCard>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  popupContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  popup: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    padding: 16,
    marginBottom: 0,
  },
  headerIcon: {
    fontSize: 24,
  },
  title: {
    ...typography.heading3,
    color: colors.primaryForeground,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.primaryForeground,
    fontWeight: 'bold',
  },
  locationInfo: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.muted,
  },
  locationName: {
    ...typography.heading3,
    color: colors.foreground,
    marginBottom: 4,
  },
  distanceText: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  gameDescription: {
    padding: 16,
  },
  descriptionTitle: {
    ...typography.heading4,
    color: colors.foreground,
    marginBottom: 8,
  },
  descriptionText: {
    ...typography.body,
    color: colors.mutedForeground,
    lineHeight: 20,
  },
  stakeInfo: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  stakeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stakeLabel: {
    ...typography.body,
    color: colors.mutedForeground,
  },
  stakeAmount: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '600',
  },
  rewardAmount: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '20',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    ...typography.caption,
    color: colors.foreground,
    flex: 1,
    lineHeight: 16,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  stakeButton: {
    backgroundColor: colors.success,
  },
  ignoreButton: {
    borderColor: colors.error,
  },
  proximityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 12,
    marginTop: 0,
  },
  proximityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  proximityText: {
    ...typography.caption,
    color: colors.mutedForeground,
  },
});
