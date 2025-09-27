import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Camera } from 'expo-camera';
import { GLView } from 'expo-gl';
import { MobileLayout } from '../components/layout/MobileLayout';
import { NeoButton } from '../components/ui/NeoButton';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';
import { api } from '../services/api';

const { width, height } = Dimensions.get('window');

interface ARChallengeData {
  starId: string;
  userId: string;
  startTime: string;
  status: string;
  arData: {
    arModel?: string;
    animation?: string;
    sound?: string;
    particleEffect?: string;
    glowColor?: string;
    size: number;
    rotation: { x: number; y: number; z: number };
  };
  star: {
    _id: string;
    name: string;
    description: string;
    rarity: string;
    type: string;
    rewards: {
      experience: number;
      tokens?: number;
      nft?: string;
    };
  };
}

interface ARChallengeScreenProps {
  route: {
    params: {
      challenge: ARChallengeData;
    };
  };
  navigation: any;
}

export const ARChallengeScreen: React.FC<ARChallengeScreenProps> = ({ route, navigation }) => {
  const { challenge } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isARActive, setIsARActive] = useState(false);
  const [challengeTime, setChallengeTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [arObjectDetected, setArObjectDetected] = useState(false);
  const glRef = useRef<any>(null);
  const cameraRef = useRef<Camera>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestCameraPermission();
    startChallengeTimer();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const startChallengeTimer = () => {
    intervalRef.current = setInterval(() => {
      setChallengeTime(prev => prev + 1);
    }, 1000);
  };

  const handleARObjectDetection = () => {
    // Simulate AR object detection
    // In a real implementation, this would use ARCore/ARKit
    setArObjectDetected(true);
    
    // Simulate interaction with AR object
    setTimeout(() => {
      completeChallenge();
    }, 2000);
  };

  const completeChallenge = async () => {
    try {
      const response = await api.post(`/location/challenge/${challenge.starId}/complete`, {
        proof: 'ar_interaction_completed',
        arInteractionData: {
          detected: true,
          interactionTime: challengeTime,
          objectType: challenge.star.type,
        },
      });

      if (response.data.success) {
        setIsCompleted(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        Alert.alert(
          'Challenge Completed!',
          `You successfully completed the ${challenge.star.name} challenge! You earned ${challenge.star.rewards.experience} XP and ${challenge.star.rewards.tokens || 0} tokens.`,
          [
            {
              text: 'Awesome!',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error completing challenge:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete challenge.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAROverlay = () => {
    if (!isARActive) return null;

    return (
      <View style={styles.arOverlay}>
        {/* AR Object Placeholder */}
        <View style={styles.arObjectContainer}>
          <View style={[
            styles.arObject,
            {
              backgroundColor: challenge.arData.glowColor || colors.primary,
              transform: [
                { scale: challenge.arData.size },
                { rotateX: `${challenge.arData.rotation.x}deg` },
                { rotateY: `${challenge.arData.rotation.y}deg` },
                { rotateZ: `${challenge.arData.rotation.z}deg` },
              ],
            },
          ]}>
            <Text style={styles.arObjectText}>
              {challenge.star.rarity === 'legendary' ? '🌟' :
               challenge.star.rarity === 'epic' ? '⭐' :
               challenge.star.rarity === 'rare' ? '✨' :
               challenge.star.rarity === 'uncommon' ? '💫' : '⭐'}
            </Text>
          </View>
        </View>

        {/* Interaction Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>AR Challenge Active</Text>
          <Text style={styles.instructionsText}>
            Look for the glowing star in your camera view and tap it to interact!
          </Text>
          <Text style={styles.challengeTime}>
            Time: {formatTime(challengeTime)}
          </Text>
        </View>

        {/* AR Object Interaction Area */}
        <TouchableOpacity
          style={styles.interactionArea}
          onPress={handleARObjectDetection}
          activeOpacity={0.8}
        >
          <View style={styles.interactionHint}>
            <Text style={styles.interactionText}>TAP TO INTERACT</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (hasPermission === null) {
    return (
      <MobileLayout>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </MobileLayout>
    );
  }

  if (hasPermission === false) {
    return (
      <MobileLayout>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission is required for AR challenges</Text>
          <NeoButton
            title="Grant Permission"
            onPress={requestCameraPermission}
            variant="electric"
            size="lg"
            style={styles.permissionButton}
          />
        </View>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Camera View */}
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          ratio="16:9"
        >
          {/* AR Overlay */}
          {renderAROverlay()}
        </Camera>

        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeName}>{challenge.star.name}</Text>
            <Text style={styles.challengeRarity}>{challenge.star.rarity.toUpperCase()}</Text>
          </View>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setCameraType(
              cameraType === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            )}
          >
            <Text style={styles.flipButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {!isARActive ? (
            <NeoButton
              title="Start AR Challenge"
              onPress={() => setIsARActive(true)}
              variant="electric"
              size="lg"
              style={styles.startButton}
            />
          ) : (
            <View style={styles.activeControls}>
              <Text style={styles.activeText}>
                {isCompleted ? 'Challenge Completed!' : 'AR Challenge Active'}
              </Text>
              {!isCompleted && (
                <NeoButton
                  title="End Challenge"
                  onPress={() => {
                    setIsARActive(false);
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                    }
                  }}
                  variant="secondary"
                  size="md"
                />
              )}
            </View>
          )}
        </View>
      </View>
    </MobileLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  arObjectContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  arObject: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.foreground,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  arObjectText: {
    fontSize: 32,
    color: colors.primaryForeground,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.card + 'CC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  instructionsTitle: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionsText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeTime: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  interactionArea: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 100,
    height: 100,
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  interactionHint: {
    position: 'absolute',
    bottom: -40,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.foreground,
  },
  interactionText: {
    ...typography.caption,
    color: colors.primaryForeground,
    fontWeight: '700',
    fontSize: 10,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: colors.card + 'CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    ...typography.body,
    color: colors.foreground,
    fontWeight: '600',
  },
  challengeInfo: {
    backgroundColor: colors.card + 'CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  challengeName: {
    ...typography.brutalSmall,
    color: colors.foreground,
  },
  challengeRarity: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  flipButton: {
    backgroundColor: colors.card + 'CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flipButtonText: {
    fontSize: 20,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  startButton: {
    marginBottom: 20,
  },
  activeControls: {
    alignItems: 'center',
  },
  activeText: {
    ...typography.brutalSmall,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    marginTop: 16,
  },
});

