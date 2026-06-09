// app/layout.tsx
import '@/app/ui/global.css';
import { inter, syne } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${syne.variable}`}>
      {/* Aplicamos 'inter' de forma nativa en el body para todos los textos,
        mientras que '--font-syne' queda registrada como variable global.
      */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}