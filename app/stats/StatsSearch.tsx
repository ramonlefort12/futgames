// app/stats/StatsSearch.tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function StatsSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    // startTransition evita que la UI se bloquee mientras el servidor procesa la nueva URL
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set('query', term);
      } else {
        params.delete('query');
      }
      // Actualizamos la URL (ej: /stats?query=espa) lo que dispara una re-renderización del Server Component
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative w-full mb-6">
      <input
        type="text"
        placeholder="Buscar selección nacional..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
        className="w-full bg-white border-3 border-retro-dark rounded-none px-4 py-3 text-xs text-retro-dark focus:outline-none focus:bg-retro-yellow/10 font-mono font-bold shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-colors"
      />
      {isPending && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-retro-green font-bold animate-pulse">
          Buscando...
        </span>
      )}
    </div>
  );
}