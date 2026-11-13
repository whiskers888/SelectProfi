/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F4F8F6',
        surface: '#ffffff',
        sub: '#F7FAF9',
        line: '#D7E5DF',
        'line-strong': '#BFD5CC',
        body: '#12201C',
        muted: '#4E6660',
        faint: '#7F9690',
        primary: {
          DEFAULT: '#0F766E',
          strong: '#115E59',
          soft: '#E6F2EF',
          mid: '#7CC4BC'
        },
        top: {
          DEFAULT: '#12201C',
          2: '#1D302B',
          line: '#2E443E',
          muted: '#9DB3AC',
          text: '#E4EEEA'
        },
        ok: { DEFAULT: '#1E6E47', bg: '#E5F3EB' },
        warn: { DEFAULT: '#9A5B08', bg: '#FCF1DC' },
        info: { DEFAULT: '#0F766E', bg: '#E6F2EF' },
        idle: { DEFAULT: '#4E6660', bg: '#EDF4F1' }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(18, 32, 28, 0.08)'
      }
    }
  },
  plugins: []
};
