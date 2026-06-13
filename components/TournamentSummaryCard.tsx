// components/TournamentSummaryCard.tsx
'use client';

import React from 'react';

interface SummaryCardProps {
  teamName: string;
  coachName: string;
  userRating: number;
  tournamentStatus: 'CHAMPION' | 'ELIMINATED' | 'PLAYING';
  currentStageIndex: number;
}

export default function TournamentSummaryCard({
  teamName,
  coachName,
  userRating,
  tournamentStatus,
  currentStageIndex
}: SummaryCardProps) {
  
  let finalPosition = 'Fase de Grupos';
  if (tournamentStatus === 'CHAMPION') {
    finalPosition = '🥇 Campeón del Mundo';
  } else if (tournamentStatus === 'ELIMINATED') {
    if (currentStageIndex === 0) finalPosition = '❌ Eliminado en Cuartos (Top 8)';
    if (currentStageIndex === 1) finalPosition = '❌ Eliminado en Semis (Top 4)';
    if (currentStageIndex === 2) finalPosition = '🥈 Subcampeón del Mundo';
  } else {
    finalPosition = 'Compitiendo...';
  }

  const teamStar = "Kylian Mbappé";
  const topScorer = "Erling Haaland (5 goles)";

  return (
    <div 
      className="w-full bg-white border-3 border-retro-dark p-6 flex flex-col items-center gap-4 text-retro-dark font-mono shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]"
    >
      {/* Cabecera de Identidad del Club */}
      <div className="w-full text-center border-b-3 border-retro-dark pb-4">
        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">
          • FICHA OFICIAL DE RENDIMIENTO •
        </span>
        <h2 className="font-black text-2xl text-retro-dark mt-2 uppercase tracking-wider retro-heading">
          {teamName || 'Dream Team FC'}
        </h2>
        <p className="text-xs text-retro-dark font-bold mt-1 uppercase tracking-wider">
          DT: <span className="text-retro-green">{coachName || 'Entrenador Anónimo'}</span>
        </p>
      </div>

      {/* Bloque Central: Rating Global (OVR) */}
      <div className="flex flex-col items-center justify-center bg-retro-yellow border-3 border-retro-dark w-32 h-32 relative font-black">
        <div className="absolute -top-4 bg-retro-cream text-retro-dark font-mono font-black text-[9px] px-3 py-1 border-2 border-retro-dark uppercase tracking-wider">
          Media OVR
        </div>
        <span className="font-black text-6xl text-retro-dark tracking-tighter">
          {userRating}
        </span>
        <span className="text-[10px] font-mono text-retro-dark uppercase mt-1 tracking-wider font-bold">
          potencia total
        </span>
      </div>

      {/* Desglose de Métricas Clave del Campeonato */}
      <div className="w-full flex flex-col gap-2 font-mono text-xs">
        
        {/* Posición Final */}
        <div className="flex justify-between items-center bg-retro-cream border-2 border-retro-dark p-2">
          <span className="text-retro-dark font-bold uppercase">Resultado:</span>
          <span className="font-black text-retro-green tracking-wide text-xs">{finalPosition}</span>
        </div>

        {/* La Estrella del Equipo */}
        <div className="flex justify-between items-center bg-retro-cream border-2 border-retro-dark p-2">
          <span className="text-retro-dark font-bold uppercase">Estrella:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-retro-red font-black">⭐</span>
            <span className="font-bold text-retro-green">{teamStar}</span>
          </div>
        </div>

        {/* Máximo Goleador */}
        <div className="flex justify-between items-center bg-retro-cream border-2 border-retro-dark p-2">
          <span className="text-retro-dark font-bold uppercase">Goleador:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-retro-red text-lg">⚽</span>
            <span className="font-bold text-retro-green">{topScorer}</span>
          </div>
        </div>

      </div>

      {/* Pie de Firma de Seguridad del Sistema */}
      <div className="w-full flex justify-between items-center border-t-3 border-retro-dark pt-3 text-[8px] font-mono text-gray-600 uppercase tracking-widest font-bold">
        <span>footgames v2.1</span>
        <span className="text-retro-red">MUNDIAL '26</span>
      </div>
    </div>
  );
}