import React from 'react';
import { Player } from '@/lib/definitions';

interface PlayerCardProps {
  player: Player;
  compact?: boolean;
  onClick?: () => void;
  hideRating?: boolean; // Propiedad añadida para la mecánica del juego
}

export default function PlayerCard({ player, compact = false, onClick, hideRating = false }: PlayerCardProps) {
  const playerName = player?.shortName || "Jugador Incógnito";
  const playerRating = player?.rating || 80;
  const playerPosition = player?.position || "MED";
  const playerNation = player?.countryId || "FIFA";
  const playerImage = player?.imageUrl || null;
  const worldCupYear = player?.worldCupEdition || "2026";

  // Lógica de ocultación para el rating
  const displayRating = hideRating ? '?' : playerRating;

  // VERSIÓN COMPACTA (Alineación interna de campo)
  if (compact) {
    return (
      <div 
        className="w-full max-w-[90px] p-2 flex flex-col items-center bg-white border-2 border-retro-dark text-center cursor-pointer hover:bg-retro-yellow active:bg-retro-cream transition-colors shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]"
        onClick={onClick}
      >
        <span className="text-[14px] font-mono font-black text-retro-dark uppercase tracking-tighter truncate w-full">
          {playerName}
        </span>
        <div className="flex gap-1 justify-center mt-1 w-full text-[12px] font-mono font-bold">
          <span className="text-retro-red">{displayRating}</span>
          <span className="text-retro-green">{playerNation.substring(0, 2).toUpperCase()}</span>
        </div>
      </div>
    );
  }

  // VERSIÓN COMPLETA REESTRUTURADA (Draft / Modal - Reducido de 265px a 200px)
  return (
    <div 
      className={`w-full max-w-[200px] p-0 relative flex flex-col items-center bg-white border-3 border-retro-dark transition-all shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] 
        ${onClick ? 'cursor-pointer hover:bg-retro-yellow/10 hover:shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]' : ''}`}
      onClick={onClick}
    >
      {/* Cenefa superior tricolor */}
      <div className="w-full h-2.5 flex flex-shrink-0">
        <div className="w-1/3 bg-retro-red"></div>
        <div className="w-1/3 bg-retro-cream"></div>
        <div className="w-1/3 bg-retro-green"></div>
      </div>

      {/* Contenedor principal */}
      <div className="w-full p-3 flex flex-col items-center">
        {/* Contenedor de foto */}
        <div className="w-full aspect-[4/5] border-3 border-retro-dark bg-gray-200 relative flex items-center justify-center overflow-hidden">
          <span className="absolute bottom-1.5 left-1.5 bg-retro-yellow text-retro-dark font-mono text-[8px] font-bold px-1.5 py-0.5 border-2 border-retro-dark uppercase tracking-wider z-10">
            WC {worldCupYear}
          </span>
          {playerImage ? (
            <img src={playerImage} alt={playerName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl opacity-20 select-none font-mono font-bold">{playerPosition}</span>
          )}
        </div>

        {/* Información del futbolista */}
        <div className="w-full mt-2.5">
          <h3 className="retro-heading text-sm text-center text-retro-dark truncate border-b-2 border-retro-dark pb-1.5 font-black uppercase tracking-wide">
            {playerName}
          </h3>
          
          {/* Tabla de estadísticas */}
          <div className="grid grid-cols-3 gap-1 mt-2 text-center font-mono text-[10px] font-bold">
            <div className="bg-retro-cream/50 p-1 border-2 border-retro-dark flex flex-col justify-center items-center">
              <span className="block text-[7px] text-gray-500 font-sans font-bold uppercase leading-none mb-0.5">POS</span>
              <span className="text-retro-green text-sm font-black leading-none">{playerPosition}</span>
            </div>
            <div className="bg-retro-cream/50 p-1 border-2 border-retro-dark flex flex-col justify-center items-center">
              <span className="block text-[7px] text-gray-500 font-sans font-bold uppercase leading-none mb-0.5">RAT</span>
              <span className="text-retro-red text-sm font-black leading-none">{displayRating}</span>
            </div>
            <div className="bg-retro-cream/50 p-1 border-2 border-retro-dark flex flex-col justify-center items-center">
              <span className="block text-[7px] text-gray-500 font-sans font-bold uppercase leading-none mb-0.5">PAÍS</span>
              <span className="text-retro-dark text-[11px] font-black uppercase tracking-tighter leading-none">{playerNation.substring(0, 3)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}