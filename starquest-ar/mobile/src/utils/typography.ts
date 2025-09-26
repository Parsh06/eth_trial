// Typography definitions for React Native

export const typography = {
  // Brutal Large - 40px, font-weight: 900
  brutalLarge: {
    fontSize: 40,
    fontWeight: '900' as const,
    lineHeight: 44,
  },
  
  // Brutal Medium - 30px, font-weight: 800
  brutalMedium: {
    fontSize: 30,
    fontWeight: '800' as const,
    lineHeight: 36,
  },
  
  // Brutal Small - 20px, font-weight: 700
  brutalSmall: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
  },
  
  // Standard Typography
  heading1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  
  heading2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  
  heading3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;
