// components/BracketView.tsx
import React from 'react';
import { PlayoffBracket, TournamentStage } from '@/app/lib/useFutgames';

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
        className={`p-1.5 border rounded-lg text-[9px] flex flex-col gap-0.5 bg-cyber-card/40 backdrop-blur-xs transition-all w-full ${
          isActive ? 'border-cyber-neon neon-glow-sm scale-[1.02]' : 'border-cyber-border/20'
        }`}
      >
        <div className={`flex justify-between items-center px-1 truncate ${m.w === m.t1 ? 'text-cyber-neon font-bold' : 'text-gray-300'}`}>
          <span className="truncate max-w-[65px]">{m.t1}</span>
          {m.w && <span className="text-[8px]">{m.w === m.t1 ? '✓' : '✗'}</span>}
        </div>
        <div className={`flex justify-between items-center px-1 truncate ${m.w === m.t2 ? 'text-cyber-neon font-bold' : 'text-gray-300'}`}>
          <span className="truncate max-w-[65px]">{m.t2}</span>
          {m.w && <span className="text-[8px]">{m.w === m.t2 ? '✓' : '✗'}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col bg-black/30 border border-cyber-border/20 rounded-2xl p-3 mb-4 font-mono select-none">
      <div className="text-[9px] text-gray-400 uppercase tracking-widest text-center border-b border-cyber-border/10 pb-2 mb-4 font-bold">
        🔲 CUADRO DE ELIMINATORIAS DE LA COPA
      </div>

      {/* REJILLA EN FORMATO ESPEJO: IZQUIERDA | CENTRO (FINAL) | DERECHA */}
      <div className="grid grid-cols-3 gap-2 items-center w-full min-h-[220px]">
        
        {/* ================= LADO IZQUIERDO ================= */}
        <div className="flex flex-col justify-between h-full gap-3">
          {/* Octavos Izquierda */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[7px] text-gray-500 font-bold uppercase text-center block">Octavos L</span>
            {octavosIzquierda.map(m => renderMatchCard(m, 'OCTAVOS'))}
          </div>
          
          {/* Conector/Cuartos Izquierda */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-gray-500 font-bold uppercase text-center block">Cuartos L</span>
            {cuartosIzquierda.map(m => renderMatchCard(m, 'CUARTOS'))}
          </div>

          {/* Semifinal Izquierda */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-gray-500 font-bold uppercase text-center block">Semi L</span>
            {semiIzquierda.map(m => renderMatchCard(m, 'SEMIS'))}
          </div>
        </div>

        {/* ================= CENTRO: GRAN FINAL ================= */}
        <div className="flex flex-col justify-center items-center h-full border-x border-cyber-border/10 px-1 self-center py-4">
          <div className="text-center mb-2 animate-pulse">
            <span className="text-[8px] text-cyber-neon font-black tracking-widest uppercase block">🏆 GRAN FINAL</span>
          </div>
          
          <div className={`p-2.5 border rounded-xl text-[10px] flex flex-col gap-1.5 bg-gradient-to-b from-cyber-card to-black w-full shadow-lg ${
            tournamentStage === 'FINAL' ? 'border-cyber-neon neon-glow-md scale-[1.05]' : 'border-cyber-border/30'
          }`}>
            <div className={`flex justify-between items-center ${bracket.final.w === bracket.final.t1 ? 'text-cyber-neon font-bold' : 'text-gray-200'}`}>
              <span className="truncate max-w-[75px] font-mono">{bracket.final.t1 || 'Finalista 1'}</span>
              {bracket.final.w && <span>{bracket.final.w === bracket.final.t1 ? '👑' : '✗'}</span>}
            </div>
            
            <div className="border-t border-dashed border-cyber-border/20 my-0.5" />
            
            <div className={`flex justify-between items-center ${bracket.final.w === bracket.final.t2 ? 'text-cyber-neon font-bold' : 'text-gray-200'}`}>
              <span className="truncate max-w-[75px] font-mono">{bracket.final.t2 || 'Finalista 2'}</span>
              {bracket.final.w && <span>{bracket.final.w === bracket.final.t2 ? '👑' : '✗'}</span>}
            </div>
          </div>
          
          {bracket.final.w && (
            <div className="mt-3 text-center text-[7px] font-mono text-cyber-neon border border-cyber-neon/30 px-1.5 py-0.5 rounded bg-cyber-neon/10 animate-bounce">
              WINNER: {bracket.final.w}
            </div>
          )}
        </div>

        {/* ================= LADO DERECHO ================= */}
        <div className="flex flex-col justify-between h-full gap-3">
          {/* Octavos Derecha */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[7px] text-gray-500 font-bold uppercase text-center block">Octavos R</span>
            {octavosDerecha.map(m => renderMatchCard(m, 'OCTAVOS'))}
          </div>
          
          {/* Conector/Cuartos Derecha */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-gray-500 font-bold uppercase text-center block">Cuartos R</span>
            {cuartosDerecha.map(m => renderMatchCard(m, 'CUARTOS'))}
          </div>

          {/* Semifinal Derecha */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[7px] text-gray-500 font-bold uppercase text-center block">Semi R</span>
            <div className="p-1.5 border border-cyber-border/10 rounded-lg text-[9px] bg-cyber-card/20 text-gray-500 text-center truncate italic">
              {bracket.cuartos[1]?.w || semiDerechaPlaceholder}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}