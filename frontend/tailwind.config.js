/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        darkBg: '#0F172A',
        darkSidebar: '#111827',
        darkCard: '#1E293B',
        darkInput: '#273449',
        darkBorder: '#334155',
        // Light theme colors
        lightBg: '#F8FAFC',
        // Premium dashboard colors
        lavenderCard: {
          light: '#EDE9FE',
          dark: 'rgba(237, 233, 254, 0.1)',
        },
        blueCard: {
          light: '#DBEAFE',
          dark: 'rgba(219, 234, 254, 0.1)',
        },
        redCard: {
          light: '#FEE2E2',
          dark: 'rgba(254, 226, 226, 0.1)',
        },
        greenCard: {
          light: '#DCFCE7',
          dark: 'rgba(220, 252, 231, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}
