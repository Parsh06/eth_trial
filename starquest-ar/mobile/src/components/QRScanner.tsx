import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useGame } from '../context/GameContext';
import { NeoButton } from './ui/NeoButton';
import { NeoCard } from './ui/NeoCard';
import { colors } from '../utils/colors';
import { typography } from '../utils/typography';

const { width, height } = Dimensions.get('window');

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onClose, onScan }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { handleQRScan } = useGame();

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Simulate haptic feedback
    Alert.alert(
      'QR Code Scanned!',
      `Data: ${data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
        {
          text: 'Process',
          onPress: () => {
            handleQRScan(data);
            onScan(data);
            onClose();
          },
        },
      ]
    );
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <NeoCard style={styles.permissionCard}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </NeoCard>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <NeoCard style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to scan QR codes for AR challenges.
          </Text>
          <NeoButton
            title="Grant Permission"
            onPress={requestPermission}
            variant="electric"
            style={styles.permissionButton}
          />
          <NeoButton
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
        </NeoCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.topOverlay}>
            <Text style={styles.overlayTitle}>Scan QR Code</Text>
            <Text style={styles.overlaySubtitle}>
              Point your camera at a QR code to scan it
            </Text>
          </View>

          {/* Scanning area */}
          <View style={styles.scanningArea}>
            <View style={styles.scanningFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* Bottom overlay */}
          <View style={styles.bottomOverlay}>
            <NeoButton
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.foreground,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlayTitle: {
    ...typography.brutalLarge,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: 8,
  },
  overlaySubtitle: {
    ...typography.body,
    color: colors.primaryForeground,
    textAlign: 'center',
  },
  scanningArea: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  permissionCard: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
  },
  permissionTitle: {
    ...typography.brutalMedium,
    color: colors.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.body,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginTop: 8,
  },
});
