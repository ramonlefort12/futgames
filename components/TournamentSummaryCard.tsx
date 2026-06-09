// components/TournamentSummaryCard.tsx
'use client';

import React from 'react';
import { syne } from '@/app/ui/fonts';

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
  
  // 1. LÓGICA DE CÁLCULO DE POSICIÓN FINAL DEL TORNEO
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

  // 2. DATOS AUXILIARES FIJOS DE RENDIMIENTO ESTADÍSTICO (Simulados para el Cromo de Redes)
  // En la Fase 4/5 estos se mapearán dinámicamente desde tu array de jugadores elegidos
  const teamStar = "Kylian Mbappé";
  const topScorer = "Erling Haaland (5 goles)";

  return (
    <div 
      className="w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-emerald-500 rounded-2xl p-6 shadow-[0_0_25px_rgba(52,211,153,0.15)] flex flex-col items-center gap-6 text-white"
    >
      {/* Cabecera de Identidad del Club */}
      <div className="w-full text-center border-b border-slate-800 pb-4">
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
          • Ficha Oficial de Rendimiento •
        </span>
        <h2 className={`${syne.className} font-extrabold text-2xl text-white mt-1 uppercase tracking-tight`}>
          {teamName || 'Dream Team FC'}
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          DT: <span className="text-white font-sans font-semibold">{coachName || 'Entrenador Anónimo'}</span>
        </p>
      </div>

      {/* Bloque Central: Rating Global (OVR) */}
      <div className="flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl w-32 h-32 relative group">
        <div className="absolute -top-2.5 bg-emerald-500 text-black font-mono font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
          Media OVR
        </div>
        <span className={`${syne.className} font-black text-5xl text-emerald-400 tracking-tighter`}>
          {userRating}
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase mt-1 tracking-wider">
          potencia total
        </span>
      </div>

      {/* Desglose de Métricas Clave del Campeonato */}
      <div className="w-full flex flex-col gap-3 font-sans text-sm">
        
        {/* Posición Final */}
        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
          <span className="text-slate-400 font-mono text-xs uppercase">Resultado:</span>
          <span className="font-bold text-white tracking-wide text-xs">{finalPosition}</span>
        </div>

        {/* La Estrella del Equipo */}
        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
          <span className="text-slate-400 font-mono text-xs uppercase">Estrella:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">{teamStar}</span>
          </div>
        </div>

        {/* Máximo Goleador */}
        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
          <span className="text-slate-400 font-mono text-xs uppercase">Goleador:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">⚽</span>
            <span className="font-semibold text-white">{topScorer}</span>
          </div>
        </div>

      </div>

      {/* Pie de Firma de Seguridad del Sistema */}
      <div className="w-full flex justify-between items-center border-t border-slate-800 pt-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
        <span>futgames v2.1</span>
        <span>autenticado por ia</span>
      </div>
    </div>
  );
}