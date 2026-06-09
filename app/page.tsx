// app/page.tsx
'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { syne } from '@/app/ui/fonts';
import SlotRenderer from '@/components/SlotRenderer';
import TournamentSummaryCard from '@/components/TournamentSummaryCard';
import PlayerCard from '@/app/ui/PlayerCard';
import BracketView from '@/components/BracketView';
import Link from 'next/link';
import { useFutgames, FORMATIONS, FormationType } from '@/app/lib/useFutgames';

export default function HomePage() {
  const game = useFutgames();
  const pitchRef = useRef<HTMLDivElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExportGraphics = async (targetRef: React.RefObject<HTMLDivElement | null>, fileName: string, typeKey: string) => {
    if (!targetRef.current) return;
    setIsExporting(typeKey);
    try {
      const canvas = await html2canvas(targetRef.current, { backgroundColor: '#0D1117', scale: 2, logging: false, useCORS: true });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        alert(`📋 Grafismo [${fileName}] copiado al portapapeles.`);
      }, 'image/png');
    } catch (e) { console.error(e); } finally { setIsExporting(null); }
  };

  return (
    <main className="min-h-screen bg-cyber-bg text-white flex flex-col items-center p-4 pb-32 md:p-6 select-none">
      
      {/* MENUS COMPARTIDOS */}
      <nav className="w-full max-w-md grid grid-cols-3 gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-center">
        <Link href="/grid" className="bg-cyber-card/60 border border-cyber-border p-2 rounded-lg font-bold">🧩 grid</Link>
        <Link href="/higher-lower" className="bg-cyber-card/60 border border-cyber-border p-2 rounded-lg font-bold">▲ más/menos</Link>
        <Link href="/trivia" className="bg-cyber-card/60 border border-cyber-border p-2 rounded-lg font-bold">🧠 trivia</Link>
      </nav>

      {/* OFF-SCREEN CAPTURE ENGINE */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none z-0">
        <div ref={pitchRef} className="w-[380px] bg-gradient-to-b from-[#11161E] to-cyber-bg border border-cyber-border rounded-2xl p-4 aspect-[3/4] flex flex-col justify-between gap-2">
          {FORMATIONS[game.currentFormation].lines.map((line, idx) => (
            <div key={idx} className="flex justify-around items-center w-full min-h-[70px]">
              {line.map((sKey) => game.lineup[sKey] ? <SlotRenderer key={sKey} slotKey={sKey} state={game.lineup[sKey]} onClick={() => {}} /> : null)}
            </div>
          ))}
        </div>
        <div ref={statsCardRef} className="w-[380px]">
          <TournamentSummaryCard teamName="Cyber Kings FC" coachName="Mister Pro" userRating={game.userRating} tournamentStatus={game.tournamentStatus} currentStageIndex={0} />
        </div>
      </div>

      {/* VISTA A: CONSTRUCCIÓN DEL DRAFT */}
      {game.view === 'PLAY' && (
        <div className="w-full max-w-md flex flex-col">
          <header className="w-full flex justify-between items-center mb-4">
            <div>
              <h1 className={`${syne.className} font-extrabold text-3xl text-cyber-neon lowercase`}>futgames</h1>
              <p className="text-[10px] text-gray-400 font-mono uppercase">v3.5 • decoupled edition</p>
            </div>
            <select
              value={game.currentFormation}
              onChange={(e) => game.setCurrentFormation(e.target.value as FormationType)}
              className="bg-cyber-card border border-cyber-border text-xs font-mono rounded-lg px-2.5 py-1.5 cursor-pointer"
            >
              {Object.keys(FORMATIONS).map((form) => <option key={form} value={form}>{form}</option>)}
            </select>
          </header>

          <div className="w-full bg-cyber-card/40 border border-cyber-border rounded-xl p-3 mb-4 flex justify-between items-center text-xs font-mono">
            <span className="text-gray-400">Media del Once:</span>
            <span className="text-cyber-neon font-bold text-sm">{game.userRating} OVR</span>
          </div>

          <section className="w-full bg-gradient-to-b from-[#11161E] to-cyber-bg border border-cyber-border rounded-2xl p-4 relative aspect-[3/4] flex flex-col justify-between gap-2">
            {FORMATIONS[game.currentFormation].lines.map((line, idx) => (
              <div key={idx} className="flex justify-around items-center w-full z-10 min-h-[70px]">
                {line.map((sKey) => game.lineup[sKey] ? <SlotRenderer key={sKey} slotKey={sKey} state={game.lineup[sKey]} onClick={() => game.handleSlotClick(sKey, game.lineup[sKey].position)} /> : null)}
              </div>
            ))}
          </section>

          <footer className="fixed bottom-0 left-0 right-0 p-4 bg-cyber-bg/80 backdrop-blur-md border-t border-cyber-border flex justify-center z-20">
            <button 
              disabled={game.totalSelected < game.totalPositionsInFormation}
              onClick={game.initTournamentStructure}
              className={`font-bold py-3 rounded-xl border transition-all text-xs uppercase tracking-wider w-full ${
                game.totalSelected === game.totalPositionsInFormation ? 'bg-cyber-neon text-black border-cyber-neon' : 'bg-cyber-card text-gray-500 cursor-not-allowed'
              }`}
            >
              {game.totalSelected === game.totalPositionsInFormation ? '🚀 Iniciar Copa del Mundo' : 'Completa la alineación'}
            </button>
          </footer>
        </div>
      )}

      {/* VISTA B: BRACKET MUNDIAL SIMULADO */}
      {game.view === 'TOURNAMENT_BRACKET' && (
        <div className="w-full max-w-lg flex flex-col items-center px-1">
          <header className="text-center mb-4 w-full">
            <h2 className={`${syne.className} font-extrabold text-xl text-white uppercase`}>WORLD CUP SIMULATOR</h2>
            <p className="text-xs text-cyber-neon font-mono mt-0.5">Fase: <span className="underline font-bold text-white">{game.tournamentStage}</span></p>
          </header>

          {game.tournamentStage.startsWith('GRUPO_J') && game.groupTeams.length > 0 && (
            <div className="w-full bg-cyber-card/60 border border-cyber-border rounded-xl p-3 mb-4 font-mono text-xs">
              <div className="grid grid-cols-12 gap-1 text-[10px] text-gray-500 font-bold border-b border-cyber-border/30 pb-1 mb-1">
                <span className="col-span-6">SELECCIÓN</span><span className="col-span-2 text-center">OVR</span><span className="col-span-2 text-center">DG</span><span className="col-span-2 text-center">PTS</span>
              </div>
              {game.groupTeams.map((team, index) => (
                <div key={team.name} className={`grid grid-cols-12 gap-1 py-1 items-center ${team.name === game.userTeamNameLabel ? 'text-cyber-neon font-bold' : 'text-gray-300'}`}>
                  <span className="col-span-6 truncate">{index + 1}. {team.name}</span>
                  <span className="col-span-2 text-center text-gray-400">{team.rating}</span>
                  <span className="col-span-2 text-center">{team.gf - team.gc}</span>
                  <span className="col-span-2 text-center font-bold">{team.points}</span>
                </div>
              ))}
            </div>
          )}

          {game.bracket && <BracketView bracket={game.bracket} tournamentStage={game.tournamentStage} />}

          {game.tournamentStatus === 'CHAMPION' && <div className="w-full text-center p-4 bg-cyber-neon/10 border border-cyber-neon rounded-xl mb-4 font-bold text-cyber-neon">🏆 ¡CAMPEÓN DEL MUNDO!</div>}
          {game.tournamentStatus === 'ELIMINATED' && <div className="w-full text-center p-4 bg-red-500/10 border border-red-500 rounded-xl mb-4 font-bold text-red-500">❌ Eliminado del Torneo</div>}

          <div className="w-full flex flex-col gap-2.5">
            {game.tournamentStatus === 'PLAYING' ? (
              <button onClick={game.handleNextRonda} className="w-full bg-cyber-neon text-black font-extrabold py-3.5 rounded-xl text-xs font-mono uppercase tracking-widest cursor-pointer">
                Simular {game.tournamentStage}
              </button>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 w-full mb-2">
                  <button onClick={() => handleExportGraphics(pitchRef, 'futgames-once', 'ONCE')} disabled={isExporting !== null} className="bg-cyber-card border border-cyber-border text-white font-bold py-3 text-[10px] font-mono uppercase rounded-xl">📸 Guardar Once</button>
                  <button onClick={() => handleExportGraphics(statsCardRef, 'futgames-stats', 'STATS')} disabled={isExporting !== null} className="bg-gradient-to-r from-cyber-neon to-emerald-500 text-black font-extrabold py-3 text-[10px] font-mono uppercase rounded-xl">📊 Ficha Torneo</button>
                </div>
                <div className="w-full flex gap-2">
                  <button onClick={game.initTournamentStructure} className="w-full bg-cyber-card border border-gray-700 text-gray-300 font-bold py-3 rounded-xl text-xs uppercase font-mono">Otro Mundial 🔄</button>
                  <button onClick={() => game.setView('PLAY')} className="w-full bg-white text-black font-bold py-3 rounded-xl text-xs uppercase font-mono">Rehacer Equipo 🏟️</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DRAFT MODAL */}
      {game.activeSlot && game.currentCountryOptions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center z-50 p-4">
          <div className="w-full max-w-md bg-cyber-card border border-cyber-border rounded-t-2xl sm:rounded-2xl p-6 flex flex-col items-center">
            <div className="text-center mb-6">
              <span className="text-xs font-mono text-cyber-neon uppercase tracking-widest font-bold">país para {game.lineup[game.activeSlot]?.position}:</span>
              <h2 className={`${syne.className} font-extrabold text-2xl text-white mt-1`}>{game.currentCountryOptions.name}</h2>
            </div>
            <div className="flex justify-center gap-3 w-full py-2">
              {game.draftCandidates.length > 0 ? (
                game.draftCandidates.map((player) => <PlayerCard key={player.id} player={player} size="sm" onClick={() => game.handleSelectPlayer(player)} />)
              ) : ( <p className="text-xs text-gray-400 font-mono">No hay jugadores disponibles.</p> )}
            </div>
            <button onClick={() => { game.setActiveSlot(null); game.setCurrentCountryOptions(null); game.setDraftCandidates([]); }} className="mt-6 text-xs font-mono text-gray-500 hover:text-white uppercase">• Cancelar •</button>
          </div>
        </div>
      )}
    </main>
  );
}