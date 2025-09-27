import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';

interface NeoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  gradient?: string[];
  [key: string]: any;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  gradient,
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.cardBorder,
      backgroundColor: colors.card,
      padding: 24,
      marginVertical: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
      minHeight: 80,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: colors.card,
        borderColor: colors.border,
      },
      elevated: {
        backgroundColor: colors.card,
        shadowColor: colors.foreground,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.border,
        shadowOpacity: 0,
        elevation: 0,
      },
      gradient: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...style,
    };
  };

  const CardContent = () => {
    if (variant === 'gradient' && gradient) {
      return (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getCardStyle()}
        >
          {children}
        </LinearGradient>
      );
    }

    if (onPress) {
      return (
        <TouchableOpacity
          style={getCardStyle()}
          onPress={onPress}
          activeOpacity={0.8}
          {...props}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View style={getCardStyle()} {...props}>
        {children}
      </View>
    );
  };

  return <CardContent />;
};