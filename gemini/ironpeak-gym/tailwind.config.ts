import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#101321',
        lime: '#ff7043',
        mist: '#fff3e5',
      },
      fontFamily: { display: ['Bebas Neue', 'Arial Narrow', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
