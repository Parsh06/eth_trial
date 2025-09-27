import React from "react";
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  StyleSheet,
  ColorValue,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../utils/colors";
import { typography } from "../../utils/typography";

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: "default" | "primary" | "electric" | "outline" | "ghost" | "gradient";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradient?: [ColorValue, ColorValue, ...ColorValue[]];
  [key: string]: any;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  title,
  onPress,
  variant = "default",
  size = "medium",
  disabled = false,
  style,
  textStyle,
  gradient,
  ...props
}) => {
  // Base button style
  const baseStyle: ViewStyle = {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.6 : 1,
    minHeight: 48,
  };

  // Size presets
  const sizeStyles: Record<string, ViewStyle> = {
    small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
    medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
    large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
  };

  // Variant styles
  const variantStyles: Record<string, ViewStyle> = {
    default: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.medium },
    primary: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.medium },
    electric: { backgroundColor: colors.electricPurple, borderColor: colors.electricPurple, ...shadows.heavy },
    outline: { backgroundColor: "transparent", borderColor: colors.foreground, ...shadows.none },
    ghost: { backgroundColor: "transparent", borderWidth: 0, ...shadows.none },
    gradient: { backgroundColor: "transparent", borderWidth: 0, ...shadows.none },
  };

  const buttonStyle = [baseStyle, sizeStyles[size], variantStyles[variant], style];

  // Text styles
  const baseTextStyle: TextStyle = { ...typography.button, fontWeight: "700", textAlign: "center" };
  const variantTextStyles: Record<string, TextStyle> = {
    default: { color: colors.primaryForeground },
    primary: { color: colors.primaryForeground },
    electric: { color: colors.primaryForeground },
    outline: { color: colors.foreground },
    ghost: { color: colors.foreground },
    gradient: { color: colors.primaryForeground },
  };
  const buttonTextStyle = [baseTextStyle, variantTextStyles[variant], textStyle];

  // Render gradient button if requested
  if (variant === "gradient" && gradient) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} {...props}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[baseStyle, sizeStyles[size], { borderRadius: 16 }, style]}
        >
          <Text style={buttonTextStyle}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Regular button
  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled} activeOpacity={0.8} {...props}>
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// Shadow presets
const shadows = StyleSheet.create({
  none: { shadowColor: "transparent", shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  medium: { shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 4 },
  heavy: { shadowColor: "#000", shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 8 },
});
