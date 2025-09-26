export const colors = {
  // Primary Colors
  primary: '#8B5CF6', // Electric Purple
  primaryForeground: '#FFFFFF',
  
  // Electric Variants
  electricPurple: '#8B5CF6',
  electricGreen: '#10B981',
  electricOrange: '#F59E0B',
  electricPink: '#EC4899',
  
  // Neutral Colors
  background: '#FFFFFF',
  foreground: '#0F172A',
  muted: '#F1F5F9',
  mutedForeground: '#64748B',
  
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
} as const;

export const gradients = {
  electric: ['#8B5CF6', '#EC4899', '#F59E0B'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
} as const;
