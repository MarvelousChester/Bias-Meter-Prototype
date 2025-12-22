/** @type {import('tailwindcss').Config} */

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        "bias-left": "#5A8DAA",
        "bias-left-leaning": "#9FB7C6",
        "bias-center": "#A9A9A9",
        "bias-right-leaning": "#D9BDBD",
        "bias-right": "#C46D6D",
        "bg-light": "#F9F9F7",
        "bg-dark": "#101622",
        "text-primary": "#212121",
        "text-secondary": "#6F6F6F",
        "border-muted": "#E5E5E2",
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      }
    },
  },
};

export default config;
