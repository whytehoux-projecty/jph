import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'vintage-sm': '0 1px 3px rgba(13, 37, 69, 0.08)',
        'vintage-md': '0 4px 12px rgba(13, 37, 69, 0.12)',
        'vintage-lg': '0 8px 24px rgba(13, 37, 69, 0.15)',
        'vintage-xl': '0 16px 48px rgba(13, 37, 69, 0.20)',
        'navy-glow': '0 0 0 3px rgba(13, 37, 69, 0.15)',
        'gold-glow': '0 4px 20px rgba(184, 150, 12, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
