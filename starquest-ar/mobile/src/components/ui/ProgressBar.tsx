import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { typography } from '../../utils/typography';

interface ProgressBarProps {
  progress: number;
  maxProgress: number;
  color?: string;
  showPercentage?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  maxProgress,
  color,
  showPercentage = true,
  label,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}) => {
  const percentage = Math.min(Math.max((progress / maxProgress) * 100, 0), 100);

  const getVariantColors = () => {
    if (color) {
      return { bg: color, text: '#FFFFFF' };
    }
    
    switch (variant) {
      case 'success':
        return { bg: colors.success, text: '#FFFFFF' };
      case 'warning':
        return { bg: colors.warning, text: '#FFFFFF' };
      case 'error':
        return { bg: colors.error, text: '#FFFFFF' };
      default:
        return { bg: colors.primary, text: '#FFFFFF' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 6, fontSize: 10, borderRadius: 3 };
      case 'large':
        return { height: 16, fontSize: 16, borderRadius: 8 };
      default:
        return { height: 12, fontSize: 14, borderRadius: 6 };
    }
  };

  const colors_variant = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View style={{ ...styles.container, ...style }}>
      {label && (
        <Text style={{ ...styles.label, ...textStyle }}>{label}</Text>
      )}
      <View style={styles.progressContainer}>
        <View
          style={{
            ...styles.progressBar,
            height: sizeStyles.height,
            backgroundColor: colors.muted,
            borderRadius: sizeStyles.borderRadius,
          }}
        >
          <LinearGradient
            colors={[colors_variant.bg, colors_variant.bg + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              ...styles.progressFill,
              width: `${percentage}%`,
              height: sizeStyles.height,
              borderRadius: sizeStyles.borderRadius,
            }}
          />
        </View>
        {showPercentage && (
          <Text
            style={{
              ...styles.percentage,
              color: colors_variant.text,
              fontSize: sizeStyles.fontSize,
            }}
          >
            {Math.round(percentage)}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.label,
    color: colors.foreground,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginRight: 8,
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressFill: {
    borderRadius: 6,
  },
  percentage: {
    ...typography.label,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
});