/**
 * Tema centralizado para UI refinada e consistente.
 */
export const colors = {
  primary: '#0d9488',
  primaryLight: '#14b8a6',
  primaryDark: '#0f766e',
  secondary: '#6366f1',
  accent: '#10b981',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  subtitle: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
};
