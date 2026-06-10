// components/BracketView.tsx
import React from 'react';
import { PlayoffBracket, TournamentStage } from '@/hooks/useTournament';

interface BracketViewProps {
  bracket: PlayoffBracket;
  tournamentStage: TournamentStage;
}

export default function BracketView({ bracket, tournamentStage }: BracketViewProps) {
  // División matemática/lógica del pool de partidos para armar la simetría especular (espejo)
  // Lado Izquierdo: Primeros partidos de las llaves
  const octavosIzquierda = bracket.octavos.slice(0, 2); // o1, o2
  const cuartosIzquierda = bracket.cuartos.slice(0, 1);  // c1
  const semiIzquierda = bracket.semis.slice(0, 1);      // s1

  // Lado Derecho: Segundos partidos de las llaves (en una app real con más datos mapearías o3, o4)
  const octavosDerecha = bracket.octavos.slice(2, 4);   // o3, o4
  const cuartosDerecha = bracket.cuartos.slice(1, 2);    // c2
  
  // Nota: Dado que tu hook maneja una sola semi activa ('s1') en su estructura simplificada,
  // simulamos el bloque opuesto de la IA de forma defensiva usando el rival pre-calculado de la final.
  const semiDerechaPlaceholder = bracket.final.t2;

  // Helper de renderizado para evitar la duplicación de marcado y mantener el código DRY
  const renderMatchCard = (m: { id: string; t1: string; t2: string; w?: string }, stageKey: TournamentStage) => {
    const isActive = tournamentStage === stageKey && (stageKey === 'OCTAVOS' ? m.id === 'o1' : stageKey === 'CUARTOS' ? m.id === 'c1' : stageKey === 'SEMIS' ? m.id === 's1' : false);
    
    return (
      <div 
        key={m.id} 
        className={`p-2 border-2 border-retro-dark text-[9px] flex flex-col gap-0.5 bg-white font-mono w-full shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] ${
          isActive ? 'bg-retro-yellow' : 'bg-white'
        }`}
      >
        <div className={`flex justify-between items-center px-1 truncate font-bold ${m.w === m.t1 ? 'text-retro-green' : 'text-retro-dark'}`}>
          <span className="truncate max-w-[65px]">{m.t1}</span>
          {m.w && <span className="text-[8px]">{m.w === m.t1 ? '✓' : '✗'}</span>}
        </div>
        <div className="border-t border-retro-dark/20"></div>
        <div className={`flex justify-between items-center px-1 truncate font-bold ${m.w === m.t2 ? 'text-retro-red' : 'text-retro-dark'}`}>
          <span className="truncate max-w-[65px]">{m.t2}</span>
          {m.w && <span className="text-[8px]">{m.w === m.t2 ? '✓' : '✗'}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col bg-retro-cream border-3 border-retro-dark p-4 mb-4 font-mono select-none shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
      <div className="text-[9px] text-retro-dark uppercase tracking-widest text-center border-b-2 border-retro-dark pb-3 mb-4 font-bold">
        🔲 CUADRO DE ELIMINATORIAS DE LA COPA
      </div>

      {/* REJILLA EN FORMATO ESPEJO: IZQUIERDA | CENTRO (FINAL) | DERECHA */}
      <div className="grid grid-cols-3 gap-2 items-center w-full min-h-[220px]">
        
        {/* ================= LADO IZQUIERDO ================= */}
        <div className="flex flex-col justify-between h-full gap-3">
          {/* Octavos Izquierda */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[7px] text-retro-dark font-bold uppercase text-center block bg-retro-yellow border border-retro-dark px-1 py-0.5">Octavos L</span>
            {octavosIzquierda.map(m => renderMatchCard(m, 'OCTAVOS'))}
          </div>
          
          {/* Conector/Cuartos Izquierda */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-retro-dark font-bold uppercase text-center block bg-retro-cream border border-retro-dark px-1 py-0.5">Cuartos L</span>
            {cuartosIzquierda.map(m => renderMatchCard(m, 'CUARTOS'))}
          </div>

          {/* Semifinal Izquierda */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-retro-dark font-bold uppercase text-center block bg-retro-cream border border-retro-dark px-1 py-0.5">Semi L</span>
            {semiIzquierda.map(m => renderMatchCard(m, 'SEMIS'))}
          </div>
        </div>

        {/* ================= CENTRO: GRAN FINAL ================= */}
        <div className="flex flex-col justify-center items-center h-full border-x-2 border-retro-dark px-2 self-center py-4">
          <div className="text-center mb-3">
            <span className="text-[8px] text-retro-green font-black tracking-widest uppercase block bg-retro-yellow border-2 border-retro-dark px-2 py-1">🏆 GRAN FINAL</span>
          </div>
          
          <div className={`p-2.5 border-2 border-retro-dark text-[10px] flex flex-col gap-1.5 bg-white w-full shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] ${
            tournamentStage === 'FINAL' ? 'bg-retro-yellow' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center font-bold ${bracket.final.w === bracket.final.t1 ? 'text-retro-green' : 'text-retro-dark'}`}>
              <span className="truncate max-w-[75px] font-mono">{bracket.final.t1 || 'Finalista 1'}</span>
              {bracket.final.w && <span>{bracket.final.w === bracket.final.t1 ? '👑' : '✗'}</span>}
            </div>
            
            <div className="border-t-2 border-retro-dark/30 my-0.5" />
            
            <div className={`flex justify-between items-center font-bold ${bracket.final.w === bracket.final.t2 ? 'text-retro-red' : 'text-retro-dark'}`}>
              <span className="truncate max-w-[75px] font-mono">{bracket.final.t2 || 'Finalista 2'}</span>
              {bracket.final.w && <span>{bracket.final.w === bracket.final.t2 ? '👑' : '✗'}</span>}
            </div>
          </div>
          
          {bracket.final.w && (
            <div className="mt-3 text-center text-[7px] font-mono text-retro-green border-2 border-retro-dark px-2 py-1 bg-retro-yellow font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
              CAMPEÓN: {bracket.final.w}
            </div>
          )}
        </div>

        {/* ================= LADO DERECHO ================= */}
        <div className="flex flex-col justify-between h-full gap-3">
          {/* Octavos Derecha */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[7px] text-retro-dark font-bold uppercase text-center block bg-retro-yellow border border-retro-dark px-1 py-0.5">Octavos R</span>
            {octavosDerecha.map(m => renderMatchCard(m, 'OCTAVOS'))}
          </div>
          
          {/* Conector/Cuartos Derecha */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-retro-dark font-bold uppercase text-center block bg-retro-cream border border-retro-dark px-1 py-0.5">Cuartos R</span>
            {cuartosDerecha.map(m => renderMatchCard(m, 'CUARTOS'))}
          </div>

          {/* Semifinal Derecha */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-retro-dark font-bold uppercase text-center block bg-retro-cream border border-retro-dark px-1 py-0.5">Semi R</span>
            <div className="p-2 border-2 border-retro-dark text-[9px] bg-retro-cream text-retro-dark text-center truncate font-bold font-mono shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
              {bracket.cuartos[1]?.w || semiDerechaPlaceholder}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}