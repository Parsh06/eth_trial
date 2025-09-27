import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../utils/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AndroidErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Android Error Boundary caught an error:', error, errorInfo);
    
    // Log Android-specific errors
    if (Platform.OS === 'android') {
      console.error('Android-specific error:', {
        message: error.message,
        stack: error.stack,
        errorInfo
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {Platform.OS === 'android' 
              ? 'Android-specific error detected. Please try restarting the app.'
              : 'An error occurred. Please try again.'
            }
          </Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
