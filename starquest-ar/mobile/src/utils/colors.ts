export const colors = {
  // Primary Colors
  primary: '#8B5CF6', // Electric Purple
  primaryForeground: '#FFFFFF',
  
  // Electric Variants with enhanced gradients
  electricPurple: '#8B5CF6',
  electricGreen: '#10B981',
  electricOrange: '#F59E0B',
  electricPink: '#EC4899',
  electricBlue: '#3B82F6',
  electricCyan: '#06B6D4',
  
  // Neutral Colors with better contrast
  background: '#FAFAFA',
  foreground: '#0F172A',
  muted: '#F8FAFC',
  mutedForeground: '#64748B',
  border: '#E2E8F0',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Star Status Colors
  starAvailable: '#8B5CF6',
  starCompleted: '#10B981',
  starLocked: '#94A3B8',
  
  // Rarity Colors
  common: '#6B7280',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
  
  // Enhanced theme colors
  card: '#FFFFFF',
  cardForeground: '#0F172A',
  popover: '#FFFFFF',
  popoverForeground: '#0F172A',
  secondary: '#F1F5F9',
  secondaryForeground: '#0F172A',
  accent: '#F1F5F9',
  accentForeground: '#0F172A',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
} as const;

export const gradients = {
  electric: ['#8B5CF6', '#EC4899', '#F59E0B'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
} as const;
