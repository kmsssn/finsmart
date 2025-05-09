/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7aa2f7', // голубоватый
          light: '#a9c0ff',
          dark: '#5b82e5',
        },
        secondary: {
          DEFAULT: '#bb9af7', // лавандовый
          light: '#d0b6fa',
          dark: '#a177f0',
        },
        success: {
          DEFAULT: '#36b37e', // текущий зеленый для доходов
          light: '#79f2c0',
          dark: '#2b8a61',
        },
        danger: {
          DEFAULT: '#f7768e', // пастельный красный для расходов
          light: '#faa9b8',
          dark: '#e04b68',
        },
        pastel: {
          blue: '#dbeafe',
          green: '#d1fae5',
          purple: '#e9d5ff',
          pink: '#fce7f3',
          yellow: '#fef3c7',
          white: '#f9fafb',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7aa2f7 0%, #a9c0ff 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #bb9af7 0%, #d0b6fa 100%)',
        'gradient-pastel': 'linear-gradient(135deg, #dbeafe 0%, #e9d5ff 50%, #f9fafb 100%)',
        'gradient-success': 'linear-gradient(135deg, #36b37e 0%, #79f2c0 100%)', 
        'gradient-danger': 'linear-gradient(135deg, #f7768e 0%, #faa9b8 100%)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
        'glow-pink': '0 0 15px rgba(236, 72, 153, 0.5)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}