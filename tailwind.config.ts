import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Identidad Visual Cyber-Pitch de Futgames
        cyber: {
          bg: '#0D1117',       // Negro slate profundo para el fondo principal
          card: '#161B22',     // Gris oscuro contenedor para cromos y módulos
          border: '#21262D',   // Gris de contraste limpio para bordes sutiles
          neon: '#00FF66',     // Verde Neón para CTAs, botones y resaltados
          glow: '#0575E6',     // Azul eléctrico para degradados de cartas leyendas
        },
        // Mapeo semántico de rarezas para los cromos deportivos
        rarity: {
          common: '#8B949E',
          silver: '#8E9EAB',
          gold: '#F5AF19',
          legend: '#00FF66',
          meme: '#FF0055',
        }
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      fontFamily: {
        // Mapeamos nuestra clase personalizada a la variable CSS inyectada en el HTML
        sports: ['var(--font-syne)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;