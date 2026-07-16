/**
 * Design system — Campo Alegre × No Ponto (premium)
 */
export const colors = {
  // Brand
  primary: '#00AEEF',
  primaryLight: '#33C2F5',
  primaryDark: '#0090C5',
  navy: '#0B4467',
  navyDeep: '#062F4A',
  cream: '#F5F0E6',
  forest: '#1B4332',

  // UI
  secondary: '#0B4467',
  accent: '#00AEEF',
  background: '#F3F6F9',
  surface: '#FFFFFF',
  surfaceElevated: '#EEF3F7',
  text: '#0B1F2A',
  textSecondary: '#5A6F7D',
  textMuted: '#8A9BAB',
  border: '#E2EAF0',
  borderStrong: '#C8D6E0',

  error: '#E11D48',
  success: '#059669',
  warning: '#D97706',

  // Overlays
  overlay: 'rgba(6, 47, 74, 0.55)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  title: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.6 },
  subtitle: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
};

export const shadows = {
  soft: {
    shadowColor: '#062F4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  card: {
    shadowColor: '#062F4A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;
