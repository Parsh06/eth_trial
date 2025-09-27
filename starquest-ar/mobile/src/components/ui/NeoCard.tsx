import React from "react";
import {
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  StyleSheet,
  ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../utils/colors";

interface NeoCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined" | "gradient";
  gradient?: [ColorValue, ColorValue, ...ColorValue[]]; // ✅ enforce tuple
  [key: string]: any;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  style,
  onPress,
  variant = "default",
  gradient,
  ...props
}) => {
  const baseStyle: ViewStyle = {
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    padding: 20,
    marginVertical: 12,
    minHeight: 80,
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      ...shadows.medium,
    },
    elevated: {
      backgroundColor: colors.card,
      borderColor: colors.foreground,
      ...shadows.heavy,
    },
    outlined: {
      backgroundColor: "transparent",
      borderWidth: 3,
      borderColor: colors.border,
      ...shadows.none,
    },
    gradient: {
      backgroundColor: "transparent",
      borderWidth: 0,
      ...shadows.none,
    },
  };

  const cardStyle = [baseStyle, variantStyles[variant], style];

  const CardContent = () => {
    if (variant === "gradient" && gradient) {
      return (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[baseStyle, { borderRadius: 20 }, style]}
        >
          {children}
        </LinearGradient>
      );
    }

    if (onPress) {
      return (
        <TouchableOpacity
          style={cardStyle}
          onPress={onPress}
          activeOpacity={0.8}
          {...props}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return (
      <View style={cardStyle} {...props}>
        {children}
      </View>
    );
  };

  return <CardContent />;
};

// ---------- Shadow Presets ----------
const shadows = StyleSheet.create({
  none: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  heavy: {
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
});
