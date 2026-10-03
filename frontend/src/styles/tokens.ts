/** Adapter-friendly design tokens. Replace imports with @csmju2030/design-system when available. */
export const designTokens = {
  colors: {
    primary: 'var(--color-primary-container)',
    secondary: 'var(--color-primary-fixed)',
    neutral: 'var(--color-on-surface-variant)',
    tertiary: 'var(--color-background)',
  },
  radius: { card: '1rem', control: '0.75rem' },
} as const;
