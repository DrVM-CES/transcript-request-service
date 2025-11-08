import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // My Future Capacity brand colors (matched to MFC app)
        mfc: {
          primary: {
            50: '#EDEFFF',
            100: '#DADEFF',
            200: '#C5CAFF',
            300: '#9BA3FF',
            400: '#7178FF',
            500: '#5B5FF5',  // Main MFC blue-purple
            600: '#4B4FDB',
            700: '#3B4BDB',  // Sidebar blue
            800: '#2A35B8',
            900: '#1A2594',
          },
          cream: '#F5F5F0',  // MFC background color
          orange: {
            100: '#FFEDD5',
            500: '#FB923C',
            600: '#F97316',
            700: '#EA580C',
          },
          blue: {
            100: '#DBEAFE',
            500: '#0EA5E9',
            600: '#3B82F6',
            700: '#06B6D4',
          },
          green: {
            100: '#DCFCE7',
            500: '#22C55E',
            600: '#16A34A',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;