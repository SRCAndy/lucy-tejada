import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['"PT Sans"', 'sans-serif'],
        headline: ['"PT Sans"', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        // Colores básicos sin variables
        background: '#ffffff',
        foreground: '#111827',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#111827',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#111827',
        },
        primary: {
          DEFAULT: '#ffc107',
          foreground: '#111827',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          foreground: '#374151',
        },
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: '#4b5563',
        },
        accent: {
          DEFAULT: '#f3f4f6',
          foreground: '#374151',
        },
        destructive: {
          DEFAULT: '#dc3545',
          foreground: '#ffffff',
        },
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#111827',
        chart: {
          '1': '#ff7300',
          '2': '#2d8659',
          '3': '#1d4d70',
          '4': '#daa520',
          '5': '#d16a1a',
        },
        sidebar: {
          DEFAULT: '#1f2937',
          foreground: '#f9fafb',
          primary: '#ffc107',
          'primary-foreground': '#1f2937',
          accent: '#374151',
          'accent-foreground': '#f9fafb',
          border: '#374151',
          ring: '#ffc107',
        },
      },
      borderRadius: {
        lg: '0.8rem',
        md: 'calc(0.8rem - 2px)',
        sm: 'calc(0.8rem - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
} satisfies Config;
