// components/SlotRenderer.tsx
'use client';

import React from 'react';
import { GridPositionState } from '@/app/lib/definitions';
import { syne } from '@/app/ui/fonts';
import PlayerCard from '@/app/ui/PlayerCard';

interface SlotRendererProps {
  slotKey: string;
  state: GridPositionState;
  onClick: () => void;
}

export default function SlotRenderer({ slotKey, state, onClick }: SlotRendererProps) {
  // Si la posición ya tiene un jugador seleccionado, renderizamos su cromo de forma directa
  if (state.selectedPlayer) {
    return <PlayerCard player={state.selectedPlayer} size="sm" onClick={onClick} />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group 
        relative 
        flex 
        flex-col 
        items-center 
        justify-center 
        w-14 
        h-14 
        md:w-16 
        md:h-16 
        rounded-full 
        bg-slate-900/50 
        backdrop-blur-sm 
        border-2 
        border-dashed 
        border-slate-600 
        hover:border-emerald-400 
        hover:bg-slate-900/90 
        transition-all 
        duration-200 
        active:scale-90 
        outline-none 
        cursor-pointer
        select-none
      "
    >
      {/* Siglas de la demarcación táctica con tipografía deportiva */}
      <span 
        className={`
          ${syne.className} 
          font-extrabold 
          text-[11px] 
          md:text-xs 
          text-slate-400 
          group-hover:text-emerald-400 
          transition-colors 
          tracking-tight
          uppercase
        `}
      >
        {state.position}
      </span>

      {/* Badge flotante inferior estilo 'Píldora' interactiva */}
      <div 
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[8px] font-mono text-slate-500 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter group-hover:border-emerald-400 group-hover:text-emerald-400 transition-colors">
        +
      </div>
    </button>
  );
}