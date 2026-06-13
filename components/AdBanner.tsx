'use client';

import { useEffect } from 'react';

export default function AdBanner() {
  useEffect(() => {
    // Esto asegura que el anuncio se inicialice solo en el cliente
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className="my-4 overflow-hidden border-2 border-retro-dark bg-retro-cream">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7536584632020794"
        data-ad-slot="7029547004"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}