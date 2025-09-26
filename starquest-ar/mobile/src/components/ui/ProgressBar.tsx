import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../utils/colors';
import { typography } from '../../utils/typography';

interface ProgressBarProps {
  progress: number; // 0-100
  max?: number;
  showPercentage?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  max = 100,
  showPercentage = true,
  label,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}) => {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.success, text: colors.primaryForeground };
      case 'warning':
        return { bg: colors.warning, text: colors.primaryForeground };
      case 'error':
        return { bg: colors.error, text: colors.primaryForeground };
      default:
        return { bg: colors.primary, text: colors.primaryForeground };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: 8, fontSize: 12 };
      case 'large':
        return { height: 16, fontSize: 16 };
      default:
        return { height: 12, fontSize: 14 };
    }
  };

  const colors_variant = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, textStyle]}>{label}</Text>
      )}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              height: sizeStyles.height,
              backgroundColor: colors.muted,
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: colors_variant.bg,
                height: sizeStyles.height,
              },
            ]}
          />
        </View>
        {showPercentage && (
          <Text
            style={[
              styles.percentage,
              {
                color: colors_variant.text,
                fontSize: sizeStyles.fontSize,
              },
            ]}
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
    ...typography.bodySmall,
    color: colors.foreground,
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  progressBar: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.foreground,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  percentage: {
    ...typography.bodySmall,
    fontWeight: '700' as const,
    minWidth: 40,
    textAlign: 'center' as const,
  },
});