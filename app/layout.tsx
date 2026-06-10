// app/layout.tsx
'use client';

import '@/app/ui/global.css';
import { inter, syne } from '@/app/ui/fonts';
import { useKonamiCode } from '@/hooks/useKonamiCode';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Instanciamos el detector global
  useKonamiCode();

  return (
    <html lang="es" className={`${syne.variable}`}>
      <head>
        <title>Simulador del Mundial - Footgames</title>
        <meta name="description" content="FutGames es tu simulador de mundiales definitivo. Crea tu equipo, compite en fases de grupos, elimina a rivales y conviértete en campeón del mundo. ¡Vive la emoción del fútbol en cada partido!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}