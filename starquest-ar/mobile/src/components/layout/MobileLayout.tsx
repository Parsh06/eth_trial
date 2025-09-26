import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../utils/colors';

interface MobileLayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showStatusBar?: boolean;
  statusBarStyle?: 'light' | 'dark' | 'auto';
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  style,
  showStatusBar = true,
  statusBarStyle = 'dark',
}) => {
  return (
    <View style={[styles.container, style]}>
      {showStatusBar && Platform.OS !== 'web' && (
        <StatusBar style={statusBarStyle} />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});