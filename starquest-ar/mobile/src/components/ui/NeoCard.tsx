import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../../utils/colors';

interface NeoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  [key: string]: any;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      borderWidth: 3,
      borderColor: colors.foreground,
      backgroundColor: colors.background,
      padding: 16,
      marginVertical: 8,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: colors.background,
      },
      elevated: {
        backgroundColor: colors.background,
        shadowColor: colors.foreground,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 2,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.7}
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