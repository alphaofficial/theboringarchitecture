export default {
  content: [
    './app/views/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ink: 'var(--ink)',
        body: 'var(--body)',
        canvas: 'var(--canvas)',
        hairline: 'var(--hairline)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        surface: {
          soft: 'var(--surface-soft)',
          card: 'var(--surface-card)',
          strong: 'var(--surface-strong)',
          dark: 'var(--surface-dark)',
          elevated: 'var(--surface-dark-elevated)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          active: 'var(--primary-active)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Cal Sans UI', 'Inter Variable', 'Segoe UI', 'sans-serif'],
        display: ['Cal Sans Display', 'Inter Variable', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
