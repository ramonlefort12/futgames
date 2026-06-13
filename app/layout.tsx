// app/layout.tsx
import '@/app/ui/global.css';
import { inter, syne } from '@/app/ui/fonts';
import { Analytics } from "@vercel/analytics/next";
import KonamiProvider from '@/components/KonamiProvider';
import Link from 'next/link';

// API Nativa de Next.js para SEO (Solo funciona en Server Components)
export const metadata = {
  title: 'FootGames - Simulador del Mundial',
  description: 'FootGames es tu simulador de mundiales definitivo. Crea tu equipo, compite en fases de grupos, elimina a rivales y conviértete en campeón del mundo.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${syne.variable}`}>
      <body className={`${inter.className} antialiased bg-retro-cream min-h-screen flex flex-col`}>
        
        {/* Inyectamos la lógica del cliente sin afectar al servidor */}
        <KonamiProvider />

        {/* MENÚ DE NAVEGACIÓN GLOBAL */}
        <header className="w-full bg-white border-b-4 border-retro-dark p-3 sm:p-4 shadow-[0_4px_0px_0px_rgba(17,24,39,1)] sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider">
            <Link 
              href="/" 
              className="text-retro-dark hover:text-retro-green transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Draft & Torneo
            </Link>
            <Link 
              href="/grid" 
              className="text-retro-dark hover:text-retro-green transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Inmaculado Grid
            </Link>
            <Link 
              href="/higher-lower" 
              className="text-retro-dark hover:text-retro-red transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Higher / Lower
            </Link>
            <Link 
              href="/trivia" 
              className="text-retro-dark hover:text-retro-yellow transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Trivia Fichajes
            </Link>
            <Link 
              href="/stats" 
              className="text-retro-dark hover:text-blue-500 transition-colors hover:underline decoration-2 underline-offset-4"
            >
              Estadísticas
            </Link>
          </nav>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        <Analytics />
      </body>
    </html>
  );
}