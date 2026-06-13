// components/SlotRenderer.tsx
'use client';

import React from 'react';
import { GridPositionState } from '@/lib/definitions';
import PlayerCard from '@/components/PlayerCard';

interface SlotRendererProps {
  slotKey: string;
  state: GridPositionState;
  onClick: () => void;
}

export default function SlotRenderer({ slotKey, state, onClick }: SlotRendererProps) {
  // Si la posición ya tiene un jugador seleccionado, renderizamos su cromo de forma compacta
  if (state.selectedPlayer) {
    return <PlayerCard player={state.selectedPlayer} compact onClick={onClick} />;
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
        rounded-none 
        bg-white 
        border-3
        border-retro-dark
        hover:border-retro-dark 
        hover:bg-retro-cream 
        active:bg-retro-yellow
        active:translate-x-0.5
        active:translate-y-0.5
        outline-none 
        cursor-pointer
        select-none
        font-mono
        shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]
        hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)]
        transition-all
      "
    >
      {/* Siglas de la demarcación táctica con tipografía retro */}
      <span 
        className={`
          font-bold 
          text-xs 
          md:text-sm 
          text-retro-dark 
          group-hover:text-retro-green 
          transition-colors 
          tracking-wider
          uppercase
        `}
      >
        {String(state.position)}
      </span>

      {/* Badge flotante inferior estilo retro */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-retro-yellow border-2 border-retro-dark text-[9px] font-mono text-retro-dark px-1.5 py-0.5 rounded-none uppercase font-bold tracking-wider shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
        +
      </div>
    </button>
  );
}