/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50:  '#f0efff',
          100: '#e4e2ff',
          200: '#ccc9ff',
          300: '#aaa4ff',
          400: '#8b84ff',
          500: '#6C63FF',
          600: '#5a50f5',
          700: '#4a40db',
          800: '#3b34b0',
          900: '#2e298a'
        },
        accent: {
          DEFAULT: '#00D4AA',
          50:  '#e6fff9',
          100: '#b3ffee',
          200: '#66ffe0',
          300: '#1affd2',
          400: '#00f0bf',
          500: '#00D4AA',
          600: '#00b891',
          700: '#009974',
          800: '#007a5c',
          900: '#005c45'
        },
        surface: {
          DEFAULT: '#1A1A2E',
          50:  '#f2f2f7',
          100: '#d9d9ed',
          200: '#b3b3db',
          300: '#8080c4',
          400: '#5555a8',
          500: '#2e2e52',
          600: '#252540',
          700: '#1A1A2E',
          800: '#12121f',
          900: '#0d0d18'
        },
        base: {
          DEFAULT: '#0A0A0F',
          50:  '#e8e8ea',
          100: '#c5c5cc',
          200: '#8f8fa0',
          300: '#5c5c73',
          400: '#333347',
          500: '#1c1c28',
          600: '#141420',
          700: '#0A0A0F',
          800: '#060609',
          900: '#020204'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)',
        'gradient-surface': 'linear-gradient(180deg, #1A1A2E 0%, #0A0A0F 100%)'
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(108, 99, 255, 0.35)',
        'glow-accent':  '0 0 20px rgba(0, 212, 170, 0.35)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}