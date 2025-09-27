export const colors = {
  // Primary Colors - Modern and vibrant
  primary: '#6366F1', // Indigo
  primaryForeground: '#FFFFFF',
  
  // Electric Variants with enhanced gradients
  electricPurple: '#8B5CF6',
  electricGreen: '#10B981',
  electricOrange: '#F59E0B',
  electricPink: '#EC4899',
  electricBlue: '#3B82F6',
  electricCyan: '#06B6D4',
  electricYellow: '#F59E0B',
  electricRed: '#EF4444',
  
  // Dark theme for better mobile experience
  background: '#0F0F23',
  backgroundSecondary: '#1A1A2E',
  foreground: '#FFFFFF',
  muted: '#2D2D44',
  mutedForeground: '#A1A1AA',
  border: '#374151',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Star Status Colors
  starAvailable: '#8B5CF6',
  starCompleted: '#10B981',
  starLocked: '#6B7280',
  
  // Rarity Colors
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
  mythic: '#EC4899',
  
  // Enhanced theme colors with glass morphism
  card: '#1F2937',
  cardForeground: '#FFFFFF',
  cardBorder: '#374151',
  popover: '#1F2937',
  popoverForeground: '#FFFFFF',
  secondary: '#374151',
  secondaryForeground: '#FFFFFF',
  accent: '#6366F1',
  accentForeground: '#FFFFFF',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  
  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
} as const;

export const gradients = {
  electric: ['#8B5CF6', '#EC4899', '#F59E0B'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
} as const;
