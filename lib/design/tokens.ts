/**
 * Design Tokens - Comprehensive Design System
 * Award-winning visual design foundation for LeetGaming Pro
 */

export const designTokens = {
  // Color System
  colors: {
    // Brand Colors
    brand: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49',
      },
      secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e',
      },
      accent: '#DCFF37', // LeetGaming signature lime
      dark: '#34445C',
    },

    // Semantic Colors
    success: {
      light: '#10b981',
      DEFAULT: '#059669',
      dark: '#047857',
    },
    warning: {
      light: '#f59e0b',
      DEFAULT: '#d97706',
      dark: '#b45309',
    },
    danger: {
      light: '#ef4444',
      DEFAULT: '#dc2626',
      dark: '#b91c1c',
    },
    info: {
      light: '#3b82f6',
      DEFAULT: '#2563eb',
      dark: '#1d4ed8',
    },

    // Neutral Scale
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
      1000: '#000000',
    },

    // Glass & Overlays
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      heavy: 'rgba(255, 255, 255, 0.3)',
      dark: 'rgba(0, 0, 0, 0.2)',
    },

    // Gradients
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      accent: 'linear-gradient(135deg, #DCFF37 0%, #a3e635 100%)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
      mono: 'var(--font-geist-mono), ui-monospace, monospace',
      display: 'var(--font-geist-sans), system-ui, sans-serif',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // Spacing Scale (4px base)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
  },

  // Layout & Containers
  layout: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '7xl': '1920px',
      container: '1400px', // Standard page container
    },
    padding: {
      mobile: '1rem', // 16px
      tablet: '1.5rem', // 24px
      desktop: '2rem', // 32px
    },
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
    '3xl': '3rem', // 48px
    full: '9999px',
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    // Premium 3D shadows
    card: '0 10px 30px -15px rgba(0, 0, 0, 0.2), 0 4px 8px -4px rgba(0, 0, 0, 0.1)',
    cardHover: '0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 8px 16px -4px rgba(0, 0, 0, 0.2)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    glow: {
      primary: '0 0 20px rgba(14, 165, 233, 0.5), 0 0 40px rgba(14, 165, 233, 0.2)',
      accent: '0 0 20px rgba(220, 255, 55, 0.5), 0 0 40px rgba(220, 255, 55, 0.2)',
      success: '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.2)',
    },
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    toast: 1700,
    top: 9999,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Transitions
  transitions: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      // Premium easing curves
      smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      snappy: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Blur Effects
  blur: {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },
} as const;

// Type exports for TypeScript autocomplete
export type DesignTokens = typeof designTokens;
export type ColorScale = keyof typeof designTokens.colors.brand.primary;
export type Spacing = keyof typeof designTokens.spacing;
export type Shadow = keyof typeof designTokens.shadows;
