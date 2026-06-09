// app/ui/fonts.ts
import { Inter, Syne } from 'next/font/google';

/**
 * Fuente principal para el cuerpo de texto, descripciones y datos secundarios.
 * Optimizada para lectura móvil en pantallas de alta densidad de píxeles.
 */
export const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Evita el bloqueo visual del texto durante la carga
});

/**
 * Fuente secundaria premium de corte deportivo y geométrico para titulares,
 * tarjetas de jugador (PlayerCard), contadores de medias y el logotipo web.
 */
export const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'], // Cargamos únicamente los pesos bold y extra-bold para no inflar el bundle
  display: 'swap',
  variable: '--font-syne', // Definimos una variable CSS para inyectarla en Tailwind
});