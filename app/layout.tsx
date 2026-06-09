// app/layout.tsx
'use client';

import '@/app/ui/global.css';
import { inter, syne } from '@/app/ui/fonts';
import { useKonamiCode } from '@/app/lib/KonamiCode';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Instanciamos el detector global
  useKonamiCode();

  return (
    <html lang="es" className={`${syne.variable}`}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}