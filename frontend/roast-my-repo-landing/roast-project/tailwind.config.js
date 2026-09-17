/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F7FC',
        bg2: '#E9F1FF',
        panel: '#FFFFFF',
        ink: '#232A3B',
        inkDim: '#6B7280',
        mint: '#37C9BE',
        coral: '#FF7A59',
        lavender: '#9C8CF2',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
