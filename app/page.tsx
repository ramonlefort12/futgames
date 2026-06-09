// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Position, GridPositionState, Player, Country, MatchSimulation } from '@/app/lib/definitions'; //[cite: 3]
import { syne } from '@/app/ui/fonts'; //[cite: 3]
import { getPlayersByCountryAndPosition } from '@/app/lib/placeholder-data'; //[cite: 3]
import { generateRandomCountriesForDraft } from '@/app/lib/utils'; //[cite: 3]
import PlayerCard from '@/app/ui/PlayerCard'; //[cite: 3]

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

// DEFINICIÓN DE LA IA COMPETIDORA (Dificultades escalonadas para el cuadro del torneo)
const RIVAL_TEAMS = [
  { name: 'Marruecos', baseRating: 82, stage: 'Cuartos' },
  { name: 'Francia', baseRating: 88, stage: 'Semis' },
  { name: 'Brasil', baseRating: 91, stage: 'Final' }
];

export default function HomePage() {
  const [currentFormation, setCurrentFormation] = useState<FormationType>('4-3-3');
  const [lineup, setLineup] = useState<Record<string, GridPositionState>>({});
  
  // NAVEGACIÓN Y ESTADOS DEL MOTOR DE SIMULACIÓN
  const [view, setView] = useState<'PLAY' | 'TOURNAMENT_BRACKET'>('PLAY');
  const [userRating, setUserRating] = useState<number>(0);
  const [matchesLog, setMatchesLog] = useState<MatchSimulation[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0); // 0: Cuartos, 1: Semis, 2: Final
  const [tournamentStatus, setTournamentStatus] = useState<'PLAYING' | 'CHAMPION' | 'ELIMINATED'>('PLAYING');

  // Estados del modal del Draft
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [currentCountryOptions, setCurrentCountryOptions] = useState<Country | null>(null);
  const [draftCandidates, setDraftCandidates] = useState<Player[]>([]);

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

  // CALCULO DE LA MEDIA GLOBAL EN TIEMPO REAL
  useEffect(() => {
    const selectedPlayers = Object.values(lineup).filter((slot) => slot.selectedPlayer);
    if (selectedPlayers.length === 0) {
      setUserRating(0);
      return;
    }
    const totalRating = selectedPlayers.reduce((sum, slot) => sum + (slot.selectedPlayer?.rating || 0), 0);
    setUserRating(Math.round(totalRating / selectedPlayers.length));
  }, [lineup]);

  /**
   * CORE ALGORÍTMICO: Simula un partido individual aplicando un ratio de variabilidad estocástica
   */
  const simulateMatch = (userPower: number, rivalPower: number, userTeamName: string, rivalTeamName: string): MatchSimulation => {
    // 1. Calculamos el diferencial de calidad base
    const powerDifferential = userPower - rivalPower;

    // 2. Definimos el factor de variabilidad (Varianza aleatoria de goles de -2 a +2 basado en distribución gaussiana simple)
    const userRandomFactor = Math.floor(Math.random() * 3) - 1; // [-1, 0, 1]
    const rivalRandomFactor = Math.floor(Math.random() * 3) - 1;

    // 3. Sistema de asignación de goles base + modificadores de rendimiento táctico
    let userGoals = 1 + userRandomFactor;
    let rivalGoals = 1 + rivalRandomFactor;

    if (powerDifferential > 5) userGoals += 1;
    else if (powerDifferential < -5) rivalGoals += 1;
    
    if (powerDifferential > 10) userGoals += 1;
    if (powerDifferential < -10) rivalGoals += 1;

    // 4. Resolución obligatoria de empates por prórroga/penaltis simulados (Mecánica rápida)
    if (userGoals === rivalGoals) {
      if (Math.random() > 0.5) {
        userGoals += 1;
      } else {
        rivalGoals += 1;
      }
    }

    const winner = userGoals > rivalGoals ? userTeamName : rivalTeamName;

    return {
      id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      homeTeamName: userTeamName,
      awayTeamName: rivalTeamName,
      homeScore: userGoals,
      awayScore: rivalGoals,
      isCompleted: true,
      winnerName: winner
    };
  };

  /**
   * CONTROLADOR DEL TORNEO: Ejecuta la ronda correspondiente paso a paso
   */
  const handleNextRonda = () => {
    const currentRival = RIVAL_TEAMS[currentStageIndex];
    const userTeamLabel = lineup[Object.keys(lineup)[0]]?.assignedCountry?.name || 'Tu Equipo';

    // Ejecutamos la simulación matemática síncrona en el cliente[cite: 1, 2]
    const result = simulateMatch(userRating, currentRival.baseRating, userTeamLabel, currentRival.name);
    
    setMatchesLog((prev) => [...prev, result]);

    if (result.winnerName === userTeamLabel) {
      // Si el usuario gana la gran final
      if (currentStageIndex === 2) {
        setTournamentStatus('CHAMPION');
      } else {
        // Pasa a la siguiente fase clasificatoria
        setCurrentStageIndex((prev) => prev + 1);
      }
    } else {
      // El usuario es eliminado del campeonato
      setTournamentStatus('ELIMINATED');
    }
  };

  const handleStartTournament = () => {
    setView('TOURNAMENT_BRACKET');
  };

  const handleSlotClick = (slotKey: string, basePosition: Position) => {
    if (lineup[slotKey]?.selectedPlayer) return;
    try {
      const randomCountries = generateRandomCountriesForDraft();
      const selectedCountry = randomCountries[0];
      const availablePlayers = getPlayersByCountryAndPosition(selectedCountry.id, basePosition);
      if (availablePlayers.length === 0) return;
      const candidates = availablePlayers.sort(() => Math.random() - 0.5).slice(0, 3);
      setActiveSlot(slotKey);
      setCurrentCountryOptions(selectedCountry);
      setDraftCandidates(candidates);
    } catch (e) { console.error(e); }
  };

  const handleSelectPlayer = (player: Player) => {
    if (!activeSlot || !currentCountryOptions) return;
    setLineup((prev) => ({
      ...prev,
      [activeSlot]: { ...prev[activeSlot], assignedCountry: currentCountryOptions, selectedPlayer: player, isLocked: true }
    }));
    setActiveSlot(null);
    setCurrentCountryOptions(null);
    setDraftCandidates([]);
  };

  const totalSelected = Object.values(lineup).filter((slot) => slot.selectedPlayer).length;
  const totalPositionsInFormation = Object.values(lineup).length;

  return (
    <main className="min-h-screen bg-cyber-bg text-white flex flex-col items-center p-4 pb-32 md:p-6 select-none">
      
      {/* VISTA 1: CONFIGURACIÓN DEL ONCE Y DRAFT */}
      {view === 'PLAY' ? (
        <>
          <header className="w-full max-w-md flex justify-between items-center mb-4">
            <div>
              <h1 className={`${syne.className} font-extrabold text-3xl tracking-tighter text-cyber-neon lowercase`}>futgames</h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">v2.1 • motor de simulación[cite: 2]</p>
            </div>
            <div className="flex flex-col items-end">
              <select
                value={currentFormation}
                onChange={(e) => setCurrentFormation(e.target.value as FormationType)}
                className="bg-cyber-card border border-cyber-border text-xs text-white font-mono rounded-lg px-2.5 py-1.5 focus:border-cyber-neon focus:outline-none cursor-pointer" //[cite: 2]
              >
                {Object.keys(FORMATIONS).map((form) => <option key={form} value={form}>{form}</option>)}
              </select>
            </div>
          </header>

          <div className="w-full max-w-md bg-cyber-card/40 border border-cyber-border rounded-xl p-3 mb-4 flex justify-between items-center text-xs font-mono"> {/*[cite: 2] */}
            <span className="text-gray-400">Media del Once:</span>
            <span className="text-cyber-neon font-bold text-sm">{userRating} OVR</span> {/*[cite: 2] */}
          </div>

          {/* CAMPO DE FÚTBOL RESPONSIVE */}
          <section className="w-full max-w-md bg-gradient-to-b from-[#11161E] to-cyber-bg border border-cyber-border rounded-2xl p-4 neon-glow-sm relative overflow-hidden aspect-[3/4] flex flex-col justify-between gap-2"> {/*[cite: 2] */}
            {FORMATIONS[currentFormation].lines.map((line, idx) => (
              <div key={idx} className="flex justify-around items-center w-full z-10 min-h-[70px]">
                {line.map((slotKey) => {
                  const slotState = lineup[slotKey];
                  return slotState ? <SlotRenderer key={slotKey} slotKey={slotKey} state={slotState} onClick={() => handleSlotClick(slotKey, slotState.position)} /> : null;
                })}
              </div>
            ))}
          </section>

          {/* BOTÓN STICKY FOOTER */}
          <footer className="fixed bottom-0 left-0 right-0 p-4 bg-cyber-bg/80 backdrop-blur-md border-t border-cyber-border flex justify-center z-20">
            <button 
              disabled={totalSelected < totalPositionsInFormation}
              onClick={handleStartTournament}
              className={`w-full max-w-md font-bold py-3 rounded-xl border transition-all font-sans text-sm uppercase tracking-wider ${
                totalSelected === totalPositionsInFormation
                  ? 'bg-cyber-neon text-black border-cyber-neon neon-glow-sm hover:scale-[1.02]' //[cite: 2]
                  : 'bg-cyber-card text-gray-500 border-cyber-border cursor-not-allowed' //[cite: 2]
              }`}
            >
              {totalSelected === totalPositionsInFormation ? '🚀 Avanzar al Torneo' : 'Completa la alineación'}
            </button>
          </footer>
        </>
      ) : (
        /* VISTA 2: MONITOR DEL CUADRO DEL TORNEO (BRACKET SCREEN) */
        <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
          <header className="text-center mb-6 w-full">
            <h2 className={`${syne.className} font-extrabold text-2xl text-white`}>Fase Final del Mundial</h2>
            <p className="text-xs text-gray-400 font-mono">Tu Plantilla: {userRating} OVR</p>
          </header>

          {/* HISTORIAL DE PARTIDOS EN TIEMPO REAL (UI ESTILO LIVESCORE) */}
          <div className="w-full flex flex-col gap-3 mb-6">
            {RIVAL_TEAMS.map((rival, index) => {
              const matchResult = matchesLog[index];
              const isCurrent = index === currentStageIndex && tournamentStatus === 'PLAYING';

              return (
                <div 
                  key={rival.name}
                  className={`w-full border rounded-xl p-4 transition-all ${
                    isCurrent 
                      ? 'bg-cyber-card border-cyber-neon neon-glow-sm scale-[1.01]' //[cite: 2]
                      : matchResult 
                        ? 'bg-cyber-card/40 border-cyber-border opacity-60' //[cite: 2]
                        : 'bg-cyber-card/10 border-cyber-border/40 opacity-30' //[cite: 2]
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                    <span>{rival.stage}</span>
                    {isCurrent && <span className="text-cyber-neon font-bold animate-pulse">• En curso •</span>} {/*[cite: 2] */}
                    {matchResult && <span className="text-gray-300 font-bold">Finalizado</span>}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">
                      {matchResult ? matchResult.homeTeamName : (lineup[Object.keys(lineup)[0]]?.assignedCountry?.name || 'Tu Equipo')}
                    </span>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg font-mono text-sm font-bold">
                      <span className={matchResult && matchResult.homeScore > matchResult.awayScore ? 'text-cyber-neon' : 'text-white'}> {/*[cite: 2] */}
                        {matchResult ? matchResult.homeScore : '-'}
                      </span>
                      <span className="text-gray-600">:</span>
                      <span className={matchResult && matchResult.awayScore > matchResult.homeScore ? 'text-cyber-neon' : 'text-white'}> {/*[cite: 2] */}
                        {matchResult ? matchResult.awayScore : '-'}
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-right">{rival.name}</span>
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 mt-1 text-right">Rival OVR: {rival.baseRating}</div>
                </div>
              );
            })}
          </div>

          {/* MENSAJES DE RESOLUCIÓN DE FIN DE JUEGO */}
          {tournamentStatus === 'CHAMPION' && (
            <div className="w-full text-center p-4 bg-cyber-neon/10 border border-cyber-neon rounded-xl mb-6 animate-bounce"> {/*[cite: 2] */}
              <h3 className={`${syne.className} font-extrabold text-xl text-cyber-neon`}>¡CAMPEÓN DEL MUNDO!</h3> {/*[cite: 2] */}
              <p className="text-xs text-gray-300 mt-1">Has derrotado a todas las potencias de la IA. Tu título se sumará al palmarés.</p>
            </div>
          )}

          {tournamentStatus === 'ELIMINATED' && (
            <div className="w-full text-center p-4 bg-red-500/10 border border-red-500 rounded-xl mb-6">
              <h3 className={`${syne.className} font-extrabold text-xl text-red-500`}>ELIMINADO</h3>
              <p className="text-xs text-gray-300 mt-1">Tu equipo no logró superar la simulación táctica. Inténtalo de nuevo.</p>
            </div>
          )}

          {/* BOTÓN OPERATIVO DE INTERACCIÓN O BIFURCACIÓN DE REINICIO */}
          <div className="w-full flex flex-col gap-3">
            {tournamentStatus === 'PLAYING' ? (
              <button
                onClick={handleNextRonda}
                className="w-full bg-cyber-neon text-black font-bold py-3.5 rounded-xl neon-glow-sm hover:scale-[1.01] transition-all text-sm uppercase tracking-wider"
              >
                Simular {RIVAL_TEAMS[currentStageIndex].stage}
              </button>
            ) : (
              /* DOS BOTONES AL ACABAR LA SIMULACIÓN (CHAMPION o ELIMINATED) */
              <div className="w-full flex flex-col sm:flex-row gap-3">
                
                {/* ACCIÓN 1: Repetir el torneo con el mismo once ideal */}
                <button
                  onClick={() => {
                    setMatchesLog([]);          // Vaciamos los partidos anteriores
                    setCurrentStageIndex(0);    // Reseteamos a Cuartos de Final
                    setTournamentStatus('PLAYING'); // Devolvemos el estado a juego activo
                  }}
                  className="w-full bg-cyber-card border border-cyber-neon text-cyber-neon font-bold py-3.5 rounded-xl neon-glow-sm hover:bg-cyber-neon/10 hover:scale-[1.01] transition-all text-sm uppercase tracking-wider"
                >
                  Repetir Simulación 🔄
                </button>

                {/* ACCIÓN 2: Destruir el equipo actual y volver al Draft */}
                <button
                  onClick={() => {
                    // Forzamos la limpieza manual del estado del lineup actual
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

                    setLineup(newState);        // Seteamos el campo vacío
                    setMatchesLog([]);          // Limpiamos logs
                    setCurrentStageIndex(0);    // Reseteamos índice de rondas
                    setTournamentStatus('PLAYING'); // Reseteamos bandera de juego
                    setView('PLAY');            // Redireccionamos a la pantalla del Draft
                  }}
                  className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 hover:scale-[1.01] transition-all text-sm uppercase tracking-wider"
                >
                  Rehacer Equipo 🏟️
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DEL DRAFT */}
      {activeSlot && currentCountryOptions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center z-50 p-4">
          <div className="w-full max-w-md bg-cyber-card border border-cyber-border rounded-t-2xl sm:rounded-2xl p-6 neon-glow-sm flex flex-col items-center"> {/*[cite: 2] */}
            <div className="text-center mb-6">
              <span className="text-xs font-mono uppercase text-cyber-neon tracking-widest font-bold">país para {lineup[activeSlot]?.position}:</span> {/*[cite: 2] */}
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

function SlotRenderer({ slotKey, state, onClick }: { slotKey: string; state: GridPositionState; onClick: () => void }) {
  if (state.selectedPlayer) return <PlayerCard player={state.selectedPlayer} size="sm" onClick={onClick} />;
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center bg-cyber-card/60 backdrop-blur-sm border border-dashed border-gray-600 hover:border-cyber-neon w-14 h-14 md:w-16 md:h-16 rounded-full transition-all duration-200 active:scale-90 group relative cursor-pointer"> {/*[cite: 2] */}
      <span className={`${syne.className} font-extrabold text-[11px] text-gray-400 group-hover:text-cyber-neon transition-colors`}>{state.position}</span>
      <div className="absolute -bottom-1 bg-cyber-bg border border-cyber-border text-[7px] font-mono text-gray-500 px-1 rounded uppercase group-hover:border-cyber-neon group-hover:text-cyber-neon">+</div>
    </button>
  );
}