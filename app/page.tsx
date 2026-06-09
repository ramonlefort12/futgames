// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Position, GridPositionState, Player, Country, MatchSimulation } from '@/app/lib/definitions';
import { syne } from '@/app/ui/fonts';
import { getPlayersByCountryAndPosition } from '@/app/lib/placeholder-data';
import { generateRandomCountriesForDraft } from '@/app/lib/utils';
import SlotRenderer from '@/components/SlotRenderer';
import TournamentSummaryCard from '@/components/TournamentSummaryCard';
import PlayerCard from '@/app/ui/PlayerCard';
import Link from 'next/link';

const FORMATIONS = {
  '4-3-3': {
    name: '4-3-3 Clásica',
    lines: [['EI', 'DC', 'ED'] as Position[], ['MC', 'MCO', 'MC2'] as Position[], ['LI', 'DFC', 'DFC2', 'LD'] as Position[], ['POR'] as Position[]]
  },
  '4-4-2': {
    name: '4-4-2 Tradicional',
    lines: [['DC', 'DC2'] as Position[], ['EI', 'MC', 'MC2', 'ED'] as Position[], ['LI', 'DFC', 'DFC2', 'LD'] as Position[], ['POR'] as Position[]]
  },
  '3-5-2': {
    name: '3-5-2 Continental',
    lines: [['DC', 'DC2'] as Position[], ['EI', 'MC', 'MCD', 'MC2', 'ED'] as Position[], ['LI', 'DFC', 'LD'] as Position[], ['POR'] as Position[]]
  }
};

type FormationType = keyof typeof FORMATIONS;

const RIVAL_TEAMS = [
  { name: 'Marruecos', baseRating: 82, stage: 'Cuartos' },
  { name: 'Francia', baseRating: 88, stage: 'Semis' },
  { name: 'Brasil', baseRating: 91, stage: 'Final' }
];

export default function HomePage() {
  const [currentFormation, setCurrentFormation] = useState<FormationType>('4-3-3');
  const [lineup, setLineup] = useState<Record<string, GridPositionState>>({});
  
  const [view, setView] = useState<'PLAY' | 'TOURNAMENT_BRACKET'>('PLAY');
  const [userRating, setUserRating] = useState<number>(0);
  const [matchesLog, setMatchesLog] = useState<MatchSimulation[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [tournamentStatus, setTournamentStatus] = useState<'PLAYING' | 'CHAMPION' | 'ELIMINATED'>('PLAYING');

  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [currentCountryOptions, setCurrentCountryOptions] = useState<Country | null>(null);
  const [draftCandidates, setDraftCandidates] = useState<Player[]>([]);

  // REFERENCIAS INDEPENDIENTES PARA CAPTURA GRÁFICA
  const pitchRef = useRef<HTMLDivElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null); // 'ONCE' | 'STATS' | null

  const [teamName, setTeamName] = useState('Cyber Kings FC');
  const [coachName, setCoachName] = useState('Mister Pro');

  // CONTROLADOR UNIFICADO DE CONVERSIÓN CANVAS CON PARAMETRIZACIÓN DE NODO
  const handleExportGraphics = async (targetRef: React.RefObject<HTMLDivElement | null>, fileName: string, typeKey: string) => {
    if (!targetRef.current) return;
    setIsExporting(typeKey);

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#0D1117',
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], `${fileName}.png`, { type: 'image/png' })] })) {
          const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
          await navigator.share({
            title: 'Resumen Táctico - Futgames',
            text: `Alineación completada con ${userRating} OVR. ¡Mira mi rendimiento!`,
            files: [file]
          });
        } else {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          alert(`📋 ¡Imagen corporativa [${fileName}] copiada al portapapeles con éxito!`);
        }
      }, 'image/png');

    } catch (error) {
      console.error(error);
      alert('Error al renderizar los gráficos en este dispositivo.');
    } finally {
      setIsExporting(null);
    }
  };

  useEffect(() => {
    const selectedFormation = FORMATIONS[currentFormation];
    const newState = {} as Record<string, GridPositionState>;
    selectedFormation.lines.flat().forEach((pos) => {
      newState[pos] = {
        position: pos.replace(/\d/g, '') as Position,
        assignedCountry: null,
        selectedPlayer: null,
        isLocked: false
      };
    });
    setLineup(newState);
    setView('PLAY');
    setTournamentStatus('PLAYING');
    setCurrentStageIndex(0);
    setMatchesLog([]);
  }, [currentFormation]);

  useEffect(() => {
    const selectedPlayers = Object.values(lineup).filter((slot) => slot.selectedPlayer);
    if (selectedPlayers.length === 0) {
      setUserRating(0);
      return;
    }
    const totalRating = selectedPlayers.reduce((sum, slot) => sum + (slot.selectedPlayer?.rating || 0), 0);
    setUserRating(Math.round(totalRating / selectedPlayers.length));
  }, [lineup]);

  const simulateMatch = (userPower: number, rivalPower: number, userTeamName: string, rivalTeamName: string): MatchSimulation => {
    const hasMaguire = Object.values(lineup).some(slot => slot.selectedPlayer?.id === 'p-maguire');
    let effectiveUserPower = userPower;
    if (hasMaguire) effectiveUserPower = Math.max(50, userPower - 12);

    const powerDifferential = effectiveUserPower - rivalPower;
    const userRandomFactor = Math.floor(Math.random() * 3) - 1;
    const rivalRandomFactor = Math.floor(Math.random() * 3) - 1;

    let userGoals = 1 + userRandomFactor;
    let rivalGoals = 1 + rivalRandomFactor;

    if (powerDifferential > 5) userGoals += 1;
    else if (powerDifferential < -5) rivalGoals += 1;
    if (powerDifferential > 10) userGoals += 1;
    if (powerDifferential < -10) rivalGoals += 1;

    if (userGoals === rivalGoals) {
      if (Math.random() > 0.5) userGoals += 1;
      else rivalGoals += 1;
    }

    return {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      homeTeamName: userTeamName,
      awayTeamName: rivalTeamName,
      homeScore: userGoals,
      awayScore: rivalGoals,
      isCompleted: true,
      winnerName: userGoals > rivalGoals ? userTeamName : rivalTeamName
    };
  };

  const handleNextRonda = () => {
    const currentRival = RIVAL_TEAMS[currentStageIndex];
    const userTeamLabel = lineup[Object.keys(lineup)[0]]?.assignedCountry?.name || 'Tu Equipo';

    const result = simulateMatch(userRating, currentRival.baseRating, userTeamLabel, currentRival.name);
    setMatchesLog((prev) => [...prev, result]);

    if (result.winnerName === userTeamLabel) {
      if (currentStageIndex === 2) {
        setTournamentStatus('CHAMPION');
        const winningCountryId = lineup[Object.keys(lineup)[0]]?.assignedCountry?.id;
        if (winningCountryId) {
          fetch('/api/win-tournament', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ countryId: winningCountryId }),
          }).catch((err) => console.error(err));
        }
      } else {
        setCurrentStageIndex((prev) => prev + 1);
      }
    } else {
      setTournamentStatus('ELIMINATED');
    }
  };

  const totalSelected = Object.values(lineup).filter((slot) => slot.selectedPlayer).length;
  const totalPositionsInFormation = Object.values(lineup).length;
  const userTeamNameLabel = lineup[Object.keys(lineup)[0]]?.assignedCountry?.name || 'Tu Equipo';

  return (
    <main className="min-h-screen bg-cyber-bg text-white flex flex-col items-center p-4 pb-32 md:p-6 select-none">
      
      {/* MENU SUPERIOR */}
      <nav className="w-full max-w-md grid grid-cols-3 gap-2 mb-4 font-mono text-[10px] uppercase tracking-wider text-center">
        <Link href="/grid" className="bg-cyber-card/60 border border-cyber-border hover:border-cyber-neon p-2 rounded-lg transition-colors text-gray-300 font-bold">🧩 grid</Link>
        <Link href="/higher-lower" className="bg-cyber-card/60 border border-cyber-border hover:border-cyber-neon p-2 rounded-lg transition-colors text-gray-300 font-bold">▲ más/menos</Link>
        <Link href="/trivia" className="bg-cyber-card/60 border border-cyber-border hover:border-cyber-neon p-2 rounded-lg transition-colors text-gray-300 font-bold">🧠 trivia</Link>
      </nav>

      <Link href="/stats" className="w-full max-w-md text-center text-[10px] font-mono text-gray-400 hover:text-cyber-neon uppercase tracking-widest mb-4">
        📊 ver tabla de mundiales globales
      </Link>

      {/* ========================================================================= */}
      {/* MOTORES OCULTOS FUERA DE PANTALLA (OFF-SCREEN RENDERING) PROHIBIDO MOSTRARLOS */}
      {/* ========================================================================= */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none z-0">
        {/* Capturador 1: El Terreno de Juego con los Cromos */}
        <div ref={pitchRef} className="w-[380px] bg-gradient-to-b from-[#11161E] to-cyber-bg border border-cyber-border rounded-2xl p-4 aspect-[3/4] flex flex-col justify-between gap-2">
          {FORMATIONS[currentFormation].lines.map((line, idx) => (
            <div key={idx} className="flex justify-around items-center w-full min-h-[70px]">
              {line.map((slotKey) => {
                const slotState = lineup[slotKey];
                return slotState ? <SlotRenderer key={slotKey} slotKey={slotKey} state={slotState} onClick={() => {}} /> : null;
              })}
            </div>
          ))}
        </div>

        {/* Capturador 2: Cromo de Ficha Analítica de Estadísticas */}
        <div ref={statsCardRef} className="w-[380px]">
          <TournamentSummaryCard 
            teamName={teamName}
            coachName={coachName}
            userRating={userRating}
            tournamentStatus={tournamentStatus}
            currentStageIndex={currentStageIndex}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERFAZ DEL JUEGO (VISTA CONFIGURACIÓN DEL ONCE) */}
      {/* ========================================================================= */}
      {view === 'PLAY' && (
        <div className="w-full max-w-md flex flex-col">
          <header className="w-full flex justify-between items-center mb-4">
            <div>
              <h1 className={`${syne.className} font-extrabold text-3xl tracking-tighter text-cyber-neon lowercase`}>futgames</h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">v2.1 • configuración</p>
            </div>
            <div className="flex flex-col items-end">
              <select
                value={currentFormation}
                onChange={(e) => setCurrentFormation(e.target.value as FormationType)}
                className="bg-cyber-card border border-cyber-border text-xs text-white font-mono rounded-lg px-2.5 py-1.5 focus:border-cyber-neon focus:outline-none cursor-pointer"
              >
                {Object.keys(FORMATIONS).map((form) => <option key={form} value={form}>{form}</option>)}
              </select>
            </div>
          </header>

          <div className="w-full bg-cyber-card/40 border border-cyber-border rounded-xl p-3 mb-4 flex justify-between items-center text-xs font-mono">
            <span className="text-gray-400">Media del Once:</span>
            <span className="text-cyber-neon font-bold text-sm">{userRating} OVR</span>
          </div>

          {/* Lienzo del Campo visible en pantalla */}
          <section className="w-full bg-gradient-to-b from-[#11161E] to-cyber-bg border border-cyber-border rounded-2xl p-4 neon-glow-sm relative overflow-hidden aspect-[3/4] flex flex-col justify-between gap-2">
            <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-col justify-between p-2">
              <div className="w-full h-1/2 border-b-2 border-white relative">
                <div className="absolute top-0 left-1/4 right-1/4 h-20 border-x-2 border-b-2 border-white mx-auto" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-20 h-20 border-2 border-white rounded-full" />
              </div>
              <div className="w-full h-1/2 relative">
                <div className="absolute bottom-0 left-1/4 right-1/4 h-20 border-x-2 border-t-2 border-white mx-auto" />
              </div>
            </div>

            {FORMATIONS[currentFormation].lines.map((line, idx) => (
              <div key={idx} className="flex justify-around items-center w-full z-10 min-h-[70px]">
                {line.map((slotKey) => {
                  const slotState = lineup[slotKey];
                  return slotState ? <SlotRenderer key={slotKey} slotKey={slotKey} state={slotState} onClick={() => handleSlotClick(slotKey, slotState.position)} /> : null;
                })}
              </div>
            ))}
          </section>

          <footer className="fixed bottom-0 left-0 right-0 p-4 bg-cyber-bg/80 backdrop-blur-md border-t border-cyber-border flex justify-center z-20">
            <button 
              disabled={totalSelected < totalPositionsInFormation}
              onClick={() => setView('TOURNAMENT_BRACKET')}
              className={`font-bold px-20 py-3 rounded-xl border transition-all font-sans text-xs uppercase tracking-wider w-full ${
                totalSelected === totalPositionsInFormation
                  ? 'bg-cyber-neon text-black border-cyber-neon neon-glow-sm hover:scale-[1.02]'
                  : 'bg-cyber-card text-gray-500 border-cyber-border cursor-not-allowed'
              }`}
            >
              {totalSelected === totalPositionsInFormation ? '🚀 Avanzar al Torneo' : 'Completa la alineación'}
            </button>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERFAZ DEL JUEGO (VISTA BRACKET DE ELIMINATORIAS DE ÁRBOL REAL) */}
      {/* ========================================================================= */}
      {view === 'TOURNAMENT_BRACKET' && (
        <div className="w-full max-w-md flex flex-col items-center animate-fade-in px-1">
          <header className="text-center mb-6 w-full">
            <h2 className={`${syne.className} font-extrabold text-2xl text-white uppercase tracking-tight`}>Fase Final Mundial</h2>
            <p className="text-xs text-cyber-neon font-mono mt-0.5">{teamName} • {userRating} OVR</p>
          </header>

          {/* CUADRO TÁCTICO EN FORMATO BRACKET DE FLUJO (Árbol de flujo de izquierda a derecha simulado de arriba a abajo) */}
          <div className="w-full flex flex-col gap-4 relative mb-6">
            
            {/* RONDA 1: CUARTOS DE FINAL */}
            <div className="flex flex-col gap-2 w-full">
              <div className="text-[9px] font-mono uppercase text-gray-500 tracking-wider pl-1">Quarterfinals (Cuartos)</div>
              <div className={`border rounded-xl p-3 bg-cyber-card/60 transition-all ${currentStageIndex === 0 && tournamentStatus === 'PLAYING' ? 'border-cyber-neon neon-glow-sm' : 'border-cyber-border/40 opacity-70'}`}>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={matchesLog[0] && matchesLog[0].winnerName === userTeamNameLabel ? 'text-cyber-neon font-bold' : 'text-white'}>{userTeamNameLabel}</span>
                  <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-gray-300">{matchesLog[0] ? `${matchesLog[0].homeScore} : ${matchesLog[0].awayScore}` : 'vs'}</span>
                  <span className={matchesLog[0] && matchesLog[0].winnerName === RIVAL_TEAMS[0].name ? 'text-cyber-neon font-bold' : 'text-white'}>{RIVAL_TEAMS[0].name}</span>
                </div>
              </div>
            </div>

            {/* CONECTORES VISUALES DE ÁRBOL */}
            <div className="h-4 w-0.5 bg-dashed border-l border-gray-700 mx-auto" />

            {/* RONDA 2: SEMIFINALES */}
            <div className="flex flex-col gap-2 w-full">
              <div className="text-[9px] font-mono uppercase text-gray-500 tracking-wider pl-1">Semifinals (Semis)</div>
              <div className={`border rounded-xl p-3 bg-cyber-card/60 transition-all ${currentStageIndex === 1 && tournamentStatus === 'PLAYING' ? 'border-cyber-neon neon-glow-sm' : matchesLog[1] ? 'border-cyber-border/40 opacity-70' : 'border-cyber-border/20 opacity-20'}`}>
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={matchesLog[1] && matchesLog[1].winnerName === userTeamNameLabel ? 'text-cyber-neon font-bold' : 'text-white'}>{matchesLog[0] && matchesLog[0].winnerName === userTeamNameLabel ? userTeamNameLabel : 'Clasificado'}</span>
                  <span className="font-mono bg-black/40 px-2 py-0.5 rounded text-gray-300">{matchesLog[1] ? `${matchesLog[1].homeScore} : ${matchesLog[1].awayScore}` : 'vs'}</span>
                  <span className={matchesLog[1] && matchesLog[1].winnerName === RIVAL_TEAMS[1].name ? 'text-cyber-neon font-bold' : 'text-white'}>{RIVAL_TEAMS[1].name}</span>
                </div>
              </div>
            </div>

            <div className="h-4 w-0.5 bg-dashed border-l border-gray-700 mx-auto" />

            {/* RONDA 3: GRAN FINAL */}
            <div className="flex flex-col gap-2 w-full">
              <div className="text-[9px] font-mono uppercase text-cyber-neon tracking-widest pl-1 font-bold">World Cup Final (Gran Final)</div>
              <div className={`border rounded-xl p-4 bg-gradient-to-r from-cyber-card to-black transition-all ${currentStageIndex === 2 && tournamentStatus === 'PLAYING' ? 'border-cyber-neon neon-glow-sm scale-[1.01]' : matchesLog[2] ? 'border-cyber-border/40 opacity-80' : 'border-cyber-border/20 opacity-20'}`}>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className={matchesLog[2] && matchesLog[2].winnerName === userTeamNameLabel ? 'text-cyber-neon animate-pulse' : 'text-white'}>{matchesLog[1] && matchesLog[1].winnerName === userTeamNameLabel ? userTeamNameLabel : 'Finalista 1'}</span>
                  <span className="font-mono bg-black/60 px-3 py-1 rounded-lg text-cyber-neon border border-cyber-border/40">{matchesLog[2] ? `${matchesLog[2].homeScore} : ${matchesLog[2].awayScore}` : 'vs'}</span>
                  <span className={matchesLog[2] && matchesLog[2].winnerName === RIVAL_TEAMS[2].name ? 'text-cyber-neon animate-pulse' : 'text-white'}>{RIVAL_TEAMS[2].name}</span>
                </div>
              </div>
            </div>

          </div>

          {/* PANELES DE NOTIFICACIÓN DE FIN DE CURSO */}
          {tournamentStatus === 'CHAMPION' && (
            <div className="w-full text-center p-4 bg-cyber-neon/10 border border-cyber-neon rounded-xl mb-4 animate-bounce">
              <h3 className={`${syne.className} font-black text-lg text-cyber-neon uppercase`}>🏆 ¡Campeón del Mundo!</h3>
              <p className="text-[11px] text-gray-300 mt-1">Tu estrategia en el draft ha doblegado a las potencias del fútbol de la IA.</p>
            </div>
          )}

          {tournamentStatus === 'ELIMINATED' && (
            <div className="w-full text-center p-4 bg-red-500/10 border border-red-500 rounded-xl mb-4">
              <h3 className={`${syne.className} font-black text-lg text-red-500 uppercase`}>❌ Eliminado del Cuadro</h3>
              <p className="text-[11px] text-gray-300 mt-1">Tu media táctica se quedó corta contra el algoritmo del rival.</p>
            </div>
          )}

          {/* CONJUNTO BIFURCADO DE BOTONES DE ACCIONES FINALES */}
          <div className="w-full flex flex-col gap-2.5">
            {tournamentStatus === 'PLAYING' ? (
              <button
                onClick={handleNextRonda}
                className="w-full bg-cyber-neon text-black font-extrabold py-3.5 rounded-xl neon-glow-sm hover:scale-[1.01] transition-all text-xs font-mono uppercase tracking-widest cursor-pointer"
              >
                Simular {RIVAL_TEAMS[currentStageIndex].stage}
              </button>
            ) : (
              <>
                {/* BOTONES DE EXPORTACIÓN GRÁFICA PARALELOS */}
                <div className="grid grid-cols-2 gap-2 w-full mb-2">
                  <button
                    onClick={() => handleExportGraphics(pitchRef, 'futgames-once', 'ONCE')}
                    disabled={isExporting !== null}
                    className="bg-cyber-card border border-cyber-border hover:border-cyber-neon text-white font-bold py-3 px-2 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer text-center"
                  >
                    {isExporting === 'ONCE' ? '⚡ Generando...' : '📸 Guardar 11 Once'}
                  </button>
                  <button
                    onClick={() => handleExportGraphics(statsCardRef, 'futgames-stats', 'STATS')}
                    disabled={isExporting !== null}
                    className="bg-gradient-to-r from-cyber-neon to-emerald-500 text-black font-extrabold py-3 px-2 rounded-xl text-[10px] font-mono uppercase tracking-wider transition-all shadow-md disabled:opacity-40 cursor-pointer text-center"
                  >
                    {isExporting === 'STATS' ? '⚡ Generando...' : '📊 Guardar Ficha Datos'}
                  </button>
                </div>

                {/* BOTONES DE REINICIO DE FLUJO */}
                <div className="w-full flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => { setMatchesLog([]); setCurrentStageIndex(0); setTournamentStatus('PLAYING'); }}
                    className="w-full bg-cyber-card/80 border border-gray-700 text-gray-300 font-bold py-3 rounded-xl text-xs font-mono uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                  >
                    Repetir Simulación 🔄
                  </button>
                  <button
                    onClick={() => {
                      const selectedFormation = FORMATIONS[currentFormation];
                      const newState = {} as Record<string, GridPositionState>;
                      selectedFormation.lines.flat().forEach((pos) => {
                        newState[pos] = { position: pos.replace(/\d/g, '') as Position, assignedCountry: null, selectedPlayer: null, isLocked: false };
                      });
                      setLineup(newState);
                      setMatchesLog([]);
                      setCurrentStageIndex(0);
                      setTournamentStatus('PLAYING');
                      setView('PLAY');
                    }}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl text-xs font-mono uppercase tracking-wider hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Rehacer Equipo 🏟️
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DEL DRAFT */}
      {activeSlot && currentCountryOptions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center z-50 p-4">
          <div className="w-full max-w-md bg-cyber-card border border-cyber-border rounded-t-2xl sm:rounded-2xl p-6 neon-glow-sm flex flex-col items-center">
            <div className="text-center mb-6">
              <span className="text-xs font-mono uppercase text-cyber-neon tracking-widest font-bold">país para {lineup[activeSlot]?.position}:</span>
              <h2 className={`${syne.className} font-extrabold text-2xl text-white mt-1`}>{currentCountryOptions.name}</h2>
            </div>
            <div className="flex justify-center gap-3 w-full py-2">
              {draftCandidates.map((player) => <PlayerCard key={player.id} player={player} size="sm" onClick={() => handleSelectPlayer(player)} />)}
            </div>
            <button onClick={() => { setActiveSlot(null); setCurrentCountryOptions(null); setDraftCandidates([]); }} className="mt-6 text-xs font-mono text-gray-500 hover:text-white uppercase tracking-wider">• Cancelar •</button>
          </div>
        </div>
      )}
    </main>
  );
}