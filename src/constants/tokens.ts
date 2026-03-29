export const colors = {
  surface: {
    primary: '#FFFFFF',
    inverse: '#000000',
    card: '#F5F5F5',
    elevated: '#1A1A1A',
  },
  foreground: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },
  border: {
    primary: 'rgba(0,0,0,0.1)',
    strong: '#000000',
  },
  status: {
    error: '#E53935',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const fonts = {
  heading: 'Anton_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  caption: 'GeistMono_400Regular',
  captionMedium: 'GeistMono_500Medium',
  captionSemiBold: 'GeistMono_600SemiBold',
} as const;

export const radius = {
  none: 0,
  sm: 4,
  full: 9999,
} as const;
