// components/ClientHomePage.tsx
'use client';

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import SlotRenderer from '@/components/SlotRenderer';
import TournamentSummaryCard from '@/components/TournamentSummaryCard';
import PlayerCard from '@/components/PlayerCard';
import { useTournaments, FORMATIONS, FormationType } from '@/hooks/useTournament';
import { Country, Player, RivalTeam } from '@/lib/definitions';

interface ClientHomePageProps {
  initialCountries: Country[];
  initialPlayers: Player[];
  initialRivals: RivalTeam[];
}

export default function ClientHomePage({ initialCountries, initialPlayers, initialRivals }: ClientHomePageProps) {
  const game = useTournaments(initialCountries, initialPlayers, initialRivals);
  const pitchRef = useRef<HTMLDivElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const [setupMode, setSetupMode] = useState<'SETUP' | 'GAME'>('SETUP');
  const [coachName, setCoachName] = useState('Mister Pro');

  const handleExportGraphics = async (targetRef: React.RefObject<HTMLDivElement | null>, fileName: string, typeKey: string) => {
    if (!targetRef.current) return;
    setIsExporting(typeKey);
    try {
      const canvas = await html2canvas(targetRef.current, { 
        backgroundColor: '#fbf9f1', 
        scale: 2, 
        logging: false, 
        useCORS: true,
        allowTaint: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        alert(`📋 Grafismo [${fileName}] copiado al portapapeles con éxito.`);
      }, 'image/png');
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsExporting(null); 
    }
  };

  const handleConfirmSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName.trim()) return;
    setSetupMode('GAME');
  };

  const renderBracketMatch = (match: any) => {
    if (!match) return <div className="border border-retro-dark/20 bg-gray-50 h-12 w-32"></div>;
    const s1 = match.score1 !== undefined ? match.score1 : '-';
    const s2 = match.score2 !== undefined ? match.score2 : '-';
    return (
      <div className="bg-white border-2 border-retro-dark font-mono text-[9px] w-32 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] flex flex-col divide-y divide-retro-dark mx-auto">
        <div className={`px-1.5 py-0.5 flex justify-between items-center ${match.w && match.w === match.t1 ? 'bg-retro-green/20 font-black' : ''}`}>
          <span className="truncate max-w-[85px]">{match.t1.toUpperCase()}</span>
          <span className="font-sans font-bold bg-retro-cream px-1 border-l border-retro-dark">{s1}</span>
        </div>
        <div className={`px-1.5 py-0.5 flex justify-between items-center ${match.w && match.w === match.t2 ? 'bg-retro-green/20 font-black' : ''}`}>
          <span className="truncate max-w-[85px]">{match.t2.toUpperCase()}</span>
          <span className="font-sans font-bold bg-retro-cream px-1 border-l border-retro-dark">{s2}</span>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen text-retro-dark flex flex-col items-center p-4 pb-32 md:p-6 select-none relative">
      
      {/* REFERENCIAS OCULTAS PARA EXPORTACIÓN HTML2CANVAS */}
      <div className="w-0 h-0 overflow-hidden opacity-0 pointer-events-none absolute">
        <div ref={pitchRef} className="w-[380px] bg-white border-3 border-retro-dark p-4 aspect-[3/4] flex flex-col justify-between gap-2 relative">
          <div className="absolute inset-0 border-8 border-retro-green/10 pointer-events-none"></div>
          {FORMATIONS[game.currentFormation].lines.map((line, idx) => (
            <div key={idx} className="flex justify-around items-center w-full min-h-[70px] z-10">
              {line.map((sKey) => game.lineup[sKey] ? <SlotRenderer key={sKey} slotKey={sKey} state={game.lineup[sKey]} onClick={() => {}} /> : null)}
            </div>
          ))}
        </div>
        <div ref={statsCardRef} className="w-[380px] border-3 border-retro-dark bg-white mt-4">
          <TournamentSummaryCard teamName={game.userTeamNameLabel.toUpperCase()} coachName={coachName} userRating={game.userRating} tournamentStatus={game.tournamentStatus} currentStageIndex={0} />
        </div>
      </div>

      {/* SETUP */}
      {setupMode === 'SETUP' && (
        <div className="w-full max-w-md bg-white border-4 border-retro-dark p-6 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] mt-4">
          <header className="mb-6 text-center border-b-2 border-retro-dark pb-4">
            <h1 className="retro-heading text-4xl text-retro-green">INSCRIPCIÓN DE COPA</h1>
            <p className="text-[10px] font-mono uppercase text-gray-500 tracking-wider font-bold">Mundial 2026 • Ajustes del Equipo</p>
          </header>

          <form onSubmit={handleConfirmSetup} className="flex flex-col gap-5 font-mono text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-gray-600 uppercase text-[10px]">Nombre del Seleccionador:</label>
              <input 
                type="text" 
                value={coachName} 
                onChange={(e) => setCoachName(e.target.value)} 
                maxLength={18}
                required
                className="w-full bg-retro-cream border-3 border-retro-dark p-2.5 font-bold focus:outline-none focus:bg-white text-retro-dark text-sm"
                placeholder="Ej. M. Bielsa"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-bold text-gray-600 uppercase text-[10px]">Selección Nacional a Dirigir:</label>
              <select 
                value={game.userTeamNameLabel} 
                onChange={(e) => game.setUserTeamNameLabel(e.target.value)}
                className="w-full bg-retro-cream border-3 border-retro-dark p-2.5 font-bold cursor-pointer focus:outline-none text-retro-dark text-sm"
              >
                {initialCountries.map((team) => (
                  <option key={team.id} value={team.name}>{team.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="retro-btn w-full bg-retro-green text-retro-cream py-3 text-sm font-black">
              Confirmar
            </button>
          </form>
        </div>
      )}

      {/* JUEGO PRINCIPAL */}
      {setupMode === 'GAME' && (
        <>
          {game.view === 'PLAY' && (
            <div className="w-full max-w-md flex flex-col mt-4">
              <header className="w-full flex justify-between items-center mb-6">
                <div>
                  <h1 className="retro-heading text-5xl text-retro-green">
                    FUT<span className="text-retro-red">GAMES</span>
                  </h1>
                  <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest font-bold">Mundial '26 • Edición Clásica</p>
                </div>
                <select
                  value={game.currentFormation}
                  onChange={(e) => game.setCurrentFormation(e.target.value as FormationType)}
                  className="bg-white border-3 border-retro-dark text-xs font-mono font-bold rounded-none px-3 py-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] focus:outline-none"
                >
                  {Object.keys(FORMATIONS).map((form) => <option key={form} value={form}>{form}</option>)}
                </select>
              </header>

              <div className="w-full bg-white border-3 border-retro-dark p-3 mb-5 grid grid-cols-2 text-xs font-mono font-bold shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] divide-x-2 divide-retro-dark">
                <div className="flex flex-col pr-2 truncate">
                  <span className="text-[9px] text-gray-400 uppercase font-sans">Seleccionador:</span>
                  <span className="text-retro-dark truncate">{coachName}</span>
                </div>
                <div className="flex flex-col pl-3 justify-between items-start">
                  <span className="text-[9px] text-gray-400 uppercase font-sans">Equipo / Valoración:</span>
                  <span className="text-retro-green truncate w-full">{game.userTeamNameLabel.toUpperCase()} <span className="bg-retro-yellow text-retro-dark px-1.5 py-0.5 border border-retro-dark text-[10px] font-black">{game.userRating} OVR</span></span>
                </div>
              </div>

              <section className="w-full bg-white border-3 border-retro-dark p-4 relative aspect-[3/4] flex flex-col justify-between gap-2 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-retro-dark/10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-retro-dark/10"></div>
                
                {FORMATIONS[game.currentFormation].lines.map((line, idx) => (
                  <div key={idx} className="flex justify-around items-center w-full z-10 min-h-[70px]">
                    {line.map((sKey) => game.lineup[sKey] ? <SlotRenderer key={sKey} slotKey={sKey} state={game.lineup[sKey]} onClick={() => game.handleSlotClick(sKey, game.lineup[sKey].position)} /> : null)}
                  </div>
                ))}
              </section>

              <footer className="fixed bottom-0 left-0 right-0 p-4 bg-retro-cream/90 border-t-3 border-retro-dark flex justify-center z-20">
                <button 
                  disabled={game.totalSelected < game.totalPositionsInFormation}
                  onClick={game.initTournamentStructure}
                  className={`w-full max-w-md retro-btn text-xs ${
                    game.totalSelected === game.totalPositionsInFormation 
                      ? 'bg-retro-green text-retro-cream' 
                      : 'bg-gray-300 text-gray-500 border-gray-400 shadow-none cursor-not-allowed'
                  }`}
                >
                  {game.totalSelected === game.totalPositionsInFormation ? 'Iniciar Campeonato Mundial' : 'Alineación Incompleta'}
                </button>
              </footer>
            </div>
          )}

          {/* SIMULADOR DE COPA CON BRACKET DE ESPEJO SIMÉTRICO */}
          {game.view === 'TOURNAMENT_BRACKET' && (
            <div className="w-full max-w-6xl flex flex-col items-center px-2 mt-4">
              <header className="text-center mb-6 w-full border-b-3 border-retro-dark pb-3">
                <h2 className="retro-heading text-3xl text-retro-dark">SIMULADOR DE COPA</h2>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-retro-red mt-1">
                  Fase Actual: <span className="bg-retro-yellow text-retro-dark px-2 py-0.5 border border-retro-dark font-black">{game.tournamentStage}</span>
                </p>
              </header>

              <div className="w-full max-w-4xl flex flex-col md:flex-row gap-5 items-stretch mb-6">
  
              {/* CAJA 1: Últimos Resultados Simulados */}
              <div className="flex-1 bg-retro-cream/50 border-3 border-retro-dark p-3 flex flex-col shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                <span className="font-mono font-bold text-retro-dark block uppercase text-center border-b-2 border-retro-dark pb-1 text-[11px]">
                  Últimos Resultados
                </span>
                
                <div className="flex-1 flex flex-col justify-center">
                  {game.matchesLog.length > 0 ? (
                    <div className="max-h-[125px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {[...game.matchesLog].reverse().slice(0, 3).map((match, idx) => (
                        <div key={idx} className="flex justify-between items-center px-2 bg-white border-2 border-retro-dark py-1.5 shadow-sm">
                          <span className="font-bold font-mono text-[9px] truncate w-1/3 text-left">
                            {match.homeTeamName.toUpperCase()}
                          </span>
                          <span className="bg-retro-dark text-retro-cream px-2 py-0.5 font-sans font-black text-[10px] min-w-[45px] text-center border border-retro-dark">
                            {match.homeScore} - {match.awayScore}
                          </span>
                          <span className="font-bold font-mono text-[9px] truncate w-1/3 text-right">
                            {match.awayTeamName.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic font-mono text-[10px] text-center my-auto">
                      No hay encuentros jugados en esta sesión.
                    </p>
                  )}
                </div>
              </div>

              {/* CAJA 2: Clasificación de Grupos */}
              {game.groupTeams && game.groupTeams.length > 0 && (
                <div className="flex-1 bg-retro-cream/50 border-3 border-retro-dark p-3 font-mono text-[9px] shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] flex flex-col">
                  <span className="font-bold text-retro-dark block mb-3 uppercase text-center border-b-2 border-retro-dark pb-1 text-[11px]">
                    Clasificación Fase de Grupos
                  </span>
                  
                  <div className="grid grid-cols-12 gap-1 text-[8px] text-gray-500 font-bold border-b-2 border-retro-dark pb-1 mb-1.5 uppercase">
                    <span className="col-span-6 pl-1">Equipo</span>
                    <span className="col-span-2 text-center">OVR</span>
                    <span className="col-span-2 text-center">DG</span>
                    <span className="col-span-2 text-center">PTS</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    {game.groupTeams.map((team, index) => (
                      <div 
                        key={team.name} 
                        className={`grid grid-cols-12 gap-1 py-1.5 items-center border-b border-dashed border-gray-300 last:border-0 transition-colors ${
                          team.name === game.userTeamNameLabel ? 'bg-retro-yellow/40 font-black' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="col-span-6 truncate text-retro-green pl-1">
                          {index + 1}. {team.name.toUpperCase()}
                        </span>
                        <span className="col-span-2 text-center text-gray-600">{team.rating}</span>
                        <span className="col-span-2 text-center text-gray-600">
                          {team.gf - team.gc > 0 ? `+${team.gf - team.gc}` : team.gf - team.gc}
                        </span>
                        <span className="col-span-2 text-center font-black text-retro-red py-0.5">
                          {team.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

              {/* ÁRBOL DE BRACKETS EN ESPEJO */}
              {game.bracket && (
                <div className="w-full max-w-full bg-retro-cream/30 border-2 border-retro-dark p-4 overflow-x-auto overflow-y-hidden touch-pan-x mb-6 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                  <div className="min-w-[800px] grid grid-cols-7 gap-2 items-center text-center">
                    
                    {/* COL 1: Octavos Izquierda */}
                    <div className="flex flex-col h-full min-h-[300px]">
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block pb-2 border-b border-retro-dark/10">
                        Octavos (Izq)
                      </span>
                      <div className="flex-1 flex flex-col justify-around py-4 gap-2">
                        {renderBracketMatch(game.bracket.octavos[0])}
                        {renderBracketMatch(game.bracket.octavos[1])}
                        {renderBracketMatch(game.bracket.octavos[2])}
                        {renderBracketMatch(game.bracket.octavos[3])}
                      </div>
                    </div>

                    {/* COL 2: Cuartos Izquierda */}
                    <div className="flex flex-col h-full min-h-[300px]">
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block pb-2 border-b border-retro-dark/10">
                        Cuartos (Izq)
                      </span>
                      <div className="flex-1 flex flex-col justify-around py-4 gap-2">
                        {renderBracketMatch(game.bracket.cuartos[0])}
                        {renderBracketMatch(game.bracket.cuartos[1])}
                      </div>
                    </div>

                    {/* COL 3: Semifinal Izquierda */}
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block pb-2 border-b border-retro-dark/10">
                        Semifinal 1
                      </span>
                      <div className="flex-1 flex flex-col justify-around py-4 gap-2">
                        {renderBracketMatch(game.bracket.semis[0])}
                      </div>
                    </div>

                    {/* COL 4: GRAN FINAL CENTRAL */}
                    <div className="flex flex-col h-full justify-center items-center relative">
                      <span className="text-[11px] font-mono font-black bg-retro-yellow border border-retro-dark px-2 py-0.5 text-retro-dark uppercase tracking-widest mb-2 select-none">
                        Gran Final
                      </span>
                      <div className="inline-block bg-white/60 p-2 border-2 m-auto border-dashed border-retro-dark/40 shadow-[2px_2px_0px_0px_rgba(17,24,39,0.1)]">
                        {renderBracketMatch(game.bracket.final)}
                      </div>
                    </div>

                    {/* COL 5: Semifinal Derecha */}
                    <div className="flex flex-col justify-center h-full">
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block pb-2 border-b border-retro-dark/10">
                        Semifinal 2
                      </span>
                      <div className="flex-1 flex flex-col justify-around py-4 gap-2">
                        {renderBracketMatch(game.bracket.semis[1])}
                      </div>
                    </div>

                    {/* COL 6: Cuartos Derecha */}
                    <div className="flex flex-col h-full min-h-[300px]">
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block pb-2 border-b border-retro-dark/10">
                        Cuartos (Der)
                      </span>
                      <div className="flex-1 flex flex-col justify-around py-4 gap-2">
                        {renderBracketMatch(game.bracket.cuartos[2])}
                        {renderBracketMatch(game.bracket.cuartos[3])}
                      </div>
                    </div>

                    {/* COL 7: Octavos Derecha */}
                    <div className="flex flex-col h-full min-h-[300px]">
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block pb-2 border-b border-retro-dark/10">
                        Octavos (Der)
                      </span>
                      <div className="flex-1 flex flex-col justify-around py-4 gap-2">
                        {renderBracketMatch(game.bracket.octavos[4])}
                        {renderBracketMatch(game.bracket.octavos[5])}
                        {renderBracketMatch(game.bracket.octavos[6])}
                        {renderBracketMatch(game.bracket.octavos[7])}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ESTADOS FINALES */}
              {game.tournamentStatus === 'CHAMPION' && (
                <div className="w-full text-center p-4 bg-retro-yellow text-retro-dark border-3 border-retro-dark font-black text-lg uppercase tracking-wider mb-5 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                  🏆 ¡{game.userTeamNameLabel.toUpperCase()} CAMPEÓN DEL MUNDO! 🏆
                </div>
              )}
              {game.tournamentStatus === 'ELIMINATED' && (
                <div className="w-full text-center p-4 bg-retro-red text-retro-cream border-3 border-retro-dark font-bold text-sm uppercase tracking-wider mb-5 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
                  ❌ Eliminado de la competición
                </div>
              )}

              {/* PANEL DE CONTROL */}
              <div className="w-full max-w-md flex flex-col gap-3">
                {game.tournamentStatus === 'PLAYING' ? (
                  <button onClick={game.handleNextRonda} className="w-full retro-btn text-sm bg-retro-red text-retro-cream py-3">
                    Simular Encuentros ({game.tournamentStage})
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button onClick={() => handleExportGraphics(pitchRef, 'futgames-once', 'ONCE')} disabled={isExporting !== null} className="bg-white border-2 border-retro-dark text-retro-dark font-bold py-3 text-[10px] font-mono uppercase shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-0.5">📸 Guardar Alineación</button>
                      <button onClick={() => handleExportGraphics(statsCardRef, 'futgames-stats', 'STATS')} disabled={isExporting !== null} className="bg-retro-yellow border-2 border-retro-dark text-retro-dark font-extrabold py-3 text-[10px] font-mono uppercase shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-0.5">📊 Ficha Técnica</button>
                    </div>
                    <div className="w-full grid grid-cols-2 gap-3">
                      <button onClick={() => { game.initTournamentStructure(); setSetupMode('SETUP'); }} className="bg-white border-2 border-retro-dark text-gray-600 font-bold py-3 text-xs uppercase font-mono shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-0.5">Otro Mundial 🔄</button>
                      <button onClick={() => game.setView('PLAY')} className="bg-retro-green border-2 border-retro-dark text-retro-cream font-bold py-3 text-xs uppercase font-mono shadow-[2px_2px_0px_0px_rgba(17,24,39,1)] active:translate-y-0.5">Rehacer Equipo Stadium</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* DRAFT MODAL */}
          {game.activeSlot && game.currentCountryOptions && (
            <div className="fixed inset-0 bg-retro-dark/80 flex flex-col justify-end sm:justify-center items-center z-50 p-4">
              <div className="w-full max-w-2xl bg-white border-4 border-retro-dark p-6 flex flex-col items-center shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] relative">
                
                <div className="absolute -top-3 left-6 bg-retro-red text-retro-cream px-3 py-0.5 border-2 border-retro-dark text-[9px] font-mono font-bold uppercase tracking-widest">
                  Draft Pick
                </div>

                <div className="text-center mb-5 w-full border-b-2 border-retro-dark pb-3">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">Posición: {game.lineup[game.activeSlot]?.position}</span>
                  <h2 className="retro-heading text-2xl text-retro-green mt-0.5">{game.currentCountryOptions.name}</h2>
                </div>

                <div className="w-full overflow-x-auto pb-4 pt-2 px-2 flex gap-4 justify-start sm:justify-center items-stretch snap-x scrollbar-thin">
                  {game.draftCandidates.length > 0 ? (
                    game.draftCandidates.map((player) => (
                      <div key={player.id} className="flex-shrink-0 snap-start flex flex-col items-center bg-retro-cream/30 p-2 border border-dashed border-retro-dark/20">
                        <PlayerCard player={player} />
                        <button 
                          onClick={() => game.handleSelectPlayer(player)} 
                          className="mt-3 w-full retro-btn text-[11px] py-2 bg-retro-dark text-retro-cream hover:bg-retro-green shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]"
                        >
                          Seleccionar cromo
                        </button>
                      </div>
                    ))
                  ) : ( 
                    <p className="text-xs text-gray-400 font-mono w-full text-center">No hay cromos disponibles para esta selección.</p> 
                  )}
                </div>

                <button 
                  onClick={() => { game.setActiveSlot(null); game.setCurrentCountryOptions(null); game.setDraftCandidates([]); }} 
                  className="mt-4 text-[10px] font-mono font-bold text-retro-red hover:underline uppercase tracking-wider">
                  • Cancelar Selección •
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}