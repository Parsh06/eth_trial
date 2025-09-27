import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';
import { typography } from '../../utils/typography';

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'electric' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
  [key: string]: any;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  title,
  onPress,
  variant = 'default',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  gradient,
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      minHeight: 48,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
      electric: {
        backgroundColor: colors.electricPurple,
        borderColor: colors.electricPurple,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: colors.foreground,
        shadowOpacity: 0,
        elevation: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
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
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...typography.button,
      fontWeight: '700',
    };

    const variantTextStyles: Record<string, TextStyle> = {
      default: { color: colors.primaryForeground },
      electric: { color: colors.primaryForeground },
      outline: { color: colors.foreground },
      ghost: { color: colors.foreground },
      gradient: { color: colors.primaryForeground },
    };

    return {
      ...baseTextStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const ButtonContent = () => {
    if (variant === 'gradient' && gradient) {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
          {...props}
        >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ ...getButtonStyle(), flex: 1 }}
        >
            <Text style={getTextStyle()}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        <Text style={getTextStyle()}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return <ButtonContent />;
};