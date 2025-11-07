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
        // My Future Capacity brand colors
        mfc: {
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            500: '#A855F7',
            600: '#8B5CF6',
            700: '#9333EA',
            900: '#581C87',
          },
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