import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui HSL tokens — keep for portal
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ── Legacy tokens (Phase 7: grep portal before removing) ──────────────
        'heritage-navy': {
          DEFAULT: '#0D2545',
          light: '#1B355B',
          mid: '#152D50',
          dark: '#091C38',
        },
        'vintage-green': {
          DEFAULT: '#0D2545',
          light: '#1B355B',
          dark: '#091C38',
        },
        'faded-gray': {
          DEFAULT: '#9CA3AF',
          light: '#B8BFC6',
        },
        'soft-gold': {
          DEFAULT: '#B8960C',
          light: '#D4AF7A',
          dark: '#8A6F07',
        },
        'warm-cream': '#F5F1E8',
        'off-white': '#FAF9F6',
        parchment: '#F9F7F4',
        'heritage-surface': '#F0F4FA',
        charcoal: {
          DEFAULT: '#3D3D3D',
          light: '#5A5A5A',
          lighter: '#787878',
        },
        // ── Ledger tokens (Heritage Trust identity) ───────────────────────────
        paper: {
          50: '#FBF9F4',  // page background
          100: '#F3EFE4', // raised / alternate surface
          200: '#E6E0D0', // hairlines
          300: '#D3CBB8', // input borders
        },
        ink: {
          900: '#14181B', // primary text 16.97:1 on paper-50
          700: '#2E353B', // secondary text 11.82:1
          500: '#5B646C', // muted 5.73:1 on paper-50
        },
        vermilion: {
          100: '#FBE3DA', // tint
          400: '#F2714B', // accent on ink-900 (6.15:1)
          600: '#C93A14', // primary action; white 5.12:1
          700: '#A62F0E', // hover; white 6.92:1
        },
        pine: {
          700: '#1D5243', // security / secondary (8.53:1 on paper-50)
        },
        success: { DEFAULT: '#1B7A4B', bg: '#E6F3EC' },
        warning: { DEFAULT: '#8A5300', bg: '#FFF3D6' },
        error: { DEFAULT: '#B42318', bg: '#FDECEA' },
        info: { DEFAULT: '#1F5FA6', bg: '#E8F0FA' },
      },
      fontFamily: {
        // Ledger fonts
        display: ['"Familjen Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Legacy fonts (Phase 7: check portal usage before removing)
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Ledger type scale
        'display-xl': ['clamp(3rem,6vw + 1rem,5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg': ['clamp(2.5rem,4.5vw + 0.5rem,4rem)', { lineHeight: '1.02', letterSpacing: '-0.025em', fontWeight: '600' }],
        h1: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        h2: ['2rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        h4: ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
        label: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
        'data-lg': ['2.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '500' }],
        data: ['1rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        // Ledger: 4px default, 2px small, 8px max (modals)
        sm: '2px',
        DEFAULT: '4px',
        md: '4px',
        lg: '8px',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      maxWidth: {
        measure: '62ch',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        // Legacy shadows (portal uses these)
        'vintage-sm': '0 1px 3px rgba(13,37,69,0.08)',
        'vintage-md': '0 4px 12px rgba(13,37,69,0.12)',
        'vintage-lg': '0 8px 24px rgba(13,37,69,0.15)',
        'vintage-xl': '0 16px 48px rgba(13,37,69,0.20)',
        'navy-glow': '0 0 0 3px rgba(13,37,69,0.15)',
        'gold-glow': '0 4px 20px rgba(184,150,12,0.25)',
        // No drop shadows in Ledger marketing — structure via hairlines only
      },
    },
  },
  plugins: [],
};

export default config;
