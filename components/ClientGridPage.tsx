// components/ClientGridPage.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Player, Country } from '@/lib/definitions';
import PlayerCard from '@/components/PlayerCard';

interface GridCriteria {
  id: string;
  name: string;
  type: 'COUNTRY' | 'POSITION';
}

interface ClientGridPageProps {
  initialPlayers: Player[];
  initialCountries: Country[];
  initialPositions: { id: string; name: string }[];
}

export default function ClientGridPage({ initialPlayers, initialCountries, initialPositions }: ClientGridPageProps) {
  const [gridState, setGridState] = useState<Record<string, Player | null>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(9);
  const [gameStatus, setGameStatus] = useState<'LOADING' | 'PLAYING' | 'WON' | 'LOST'>('LOADING');

  // Estados para las filas y columnas dinámicas
  const [rows, setRows] = useState<GridCriteria[]>([]);
  const [cols, setCols] = useState<GridCriteria[]>([]);

  // 1. GENERACIÓN DINÁMICA DEL TABLERO
  useEffect(() => {
    if (initialCountries.length > 0 && initialPositions.length > 0) {
      // Barajamos países y cogemos 3
      const shuffledCountries = [...initialCountries]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => ({ id: c.id, name: c.name, type: 'COUNTRY' as const }));

      // Barajamos posiciones y cogemos 3
      const shuffledPositions = [...initialPositions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(p => ({ id: p.id, name: p.name, type: 'POSITION' as const }));

      setRows(shuffledCountries);
      setCols(shuffledPositions);
      setGameStatus('PLAYING');
    }
  }, [initialCountries, initialPositions]);

  // Filtrado de la búsqueda (ignora mayúsculas y tildes)
  const filteredPlayers = initialPlayers.filter(player => {
    const cleanSearch = searchQuery.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanName = player.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanShort = player.shortName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    return (cleanName.includes(cleanSearch) || cleanShort.includes(cleanSearch)) &&
           !Object.values(gridState).some(p => p?.id === player.id);
  });

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (gameStatus !== 'PLAYING') return;
    const cellKey = `${rowIndex}-${colIndex}`;
    if (gridState[cellKey]) return; // Celda ya resuelta

    setSelectedCell(cellKey);
    setSearchQuery('');
  };

  const handleGuessPlayer = (player: Player) => {
    if (!selectedCell) return;

    const [rowIndexStr, colIndexStr] = selectedCell.split('-');
    const rowIndex = parseInt(rowIndexStr);
    const colIndex = parseInt(colIndexStr);

    const rowCriterio = rows[rowIndex];
    const colCriterio = cols[colIndex];

    // 2. VALIDACIÓN ALGORÍTMICA DINÁMICA
    // Validamos que el país coincida
    const matchesCountry = player.countryId === rowCriterio.id;
    // Validamos que la posición coincida (sea la principal o una de las secundarias devueltas por Neon)
    const matchesPosition = player.position === colCriterio.id || player.otherPositions.includes(colCriterio.id);

    if (matchesCountry && matchesPosition) {
      // Acierto
      const newGridState = { ...gridState, [selectedCell]: player };
      setGridState(newGridState);

      if (Object.keys(newGridState).length === 9) {
        setGameStatus('WON');
      }
    } else {
      // Fallo
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      if (nextAttempts === 0) {
        setGameStatus('LOST');
      }
      alert(`¡Incorrecto! ${player.shortName} no cumple las condiciones de la celda (Requiere: ${rowCriterio.name} + ${colCriterio.name}).`);
    }

    setSelectedCell(null);
  };

  if (gameStatus === 'LOADING') {
    return <div className="min-h-screen bg-retro-cream flex items-center justify-center font-mono font-bold">Generando Tablero...</div>;
  }

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">

        <header className="mb-6">
          <h1 className="retro-heading font-black text-3xl tracking-tighter uppercase">
            Inmaculado <span className="text-retro-green">Grid</span>
          </h1>
          <p className="text-xs text-gray-600 font-mono mt-2 font-bold">
            Cruza países y posiciones. Tienes 9 intentos para resolver el tablero completo.
          </p>
        </header>

        <div className="bg-white border-2 border-retro-dark rounded-none p-3 mb-6 flex justify-between items-center text-xs font-mono font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
          <span className="text-retro-dark">Intentos disponibles:</span>
          <span className={`${attemptsLeft <= 3 ? 'text-retro-red' : 'text-retro-dark'} bg-retro-yellow px-2 py-0.5 border border-retro-dark`}>
            {attemptsLeft} / 9
          </span>
        </div>

        {gameStatus === 'WON' && (
          <div className="bg-retro-yellow border-2 border-retro-dark text-retro-dark text-center rounded-none p-4 mb-4 text-sm font-bold font-mono uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(17,24,39,1)]">
            ¡TABLERO IMPECABLE COMPLETADO!
          </div>
        )}
        {gameStatus === 'LOST' && (
          <div className="bg-retro-red border-2 border-retro-dark text-retro-cream text-center rounded-none p-4 mb-4 text-sm font-bold font-mono uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(17,24,39,1)]">
            FIN DEL JUEGO - SIN INTENTOS
          </div>
        )}

        {/* LA REJILLA / GRID */}
        <div className="grid grid-cols-4 gap-2 w-full aspect-square bg-white border-2 border-retro-dark rounded-none p-2 relative shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
          
          <div className="flex items-center justify-center text-[9px] font-mono text-retro-dark font-bold uppercase">
            footgames
          </div>

          {cols.map((col) => (
            <div key={col.id} className="flex items-center justify-center text-center bg-retro-yellow border-2 border-retro-dark rounded-none px-1 text-[10px] font-bold text-retro-dark font-mono uppercase truncate">
              {col.name}
            </div>
          ))}

          {rows.map((row, rowIndex) => (
            <div key={row.id || rowIndex} className="contents">
              <div className="flex items-center justify-center text-[9px] font-mono font-bold text-retro-dark uppercase border-2 border-retro-dark bg-retro-yellow rounded-none truncate px-1">
                {row.name}
              </div>

              {[0, 1, 2].map((colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`;
                const solvedPlayer = gridState[cellKey];

                return (
                  <button
                    key={cellKey}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={gameStatus !== 'PLAYING' || !!solvedPlayer}
                    className={`aspect-square rounded-none flex flex-col items-center justify-center border-2 transition-all duration-200 overflow-hidden font-bold ${
                      solvedPlayer 
                        ? 'border-retro-dark p-0 bg-transparent' 
                        : 'bg-retro-cream border-retro-dark hover:border-retro-dark hover:bg-white cursor-pointer shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]'
                    }`}
                  >
                    {solvedPlayer ? (
                      <PlayerCard player={solvedPlayer} compact />
                    ) : (
                      <span className="text-retro-dark text-2xl font-bold">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* MODAL DE BÚSQUEDA */}
        {selectedCell !== null && (
          <div className="fixed inset-0 bg-retro-dark/80 flex flex-col justify-end sm:justify-center items-center z-50 p-4">
            <div className="w-full max-w-md bg-white border-3 border-retro-dark rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] flex flex-col">
              
              <header className="mb-4 border-b-2 border-retro-dark pb-3">
                <h3 className="text-sm font-mono text-retro-green font-bold uppercase tracking-wider">Adivinar Futbolista</h3>
                <p className="text-xs text-gray-600 mt-1 font-mono font-bold">Introduce el nombre de un jugador que cumpla ambos requisitos.</p>
              </header>

              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Casillas, Messi, R9..."
                className="w-full bg-retro-cream border-2 border-retro-dark rounded-none px-4 py-2 text-xs text-retro-dark focus:border-retro-dark focus:outline-none font-mono font-bold mb-4"
              />

              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {searchQuery.trim().length > 0 ? (
                  filteredPlayers.length > 0 ? (
                    filteredPlayers.slice(0, 10).map((player) => ( // Límite de 10 resultados para rendimiento
                      <button
                        key={player.id}
                        onClick={() => handleGuessPlayer(player)}
                        className="w-full bg-white border-2 border-retro-dark hover:bg-retro-yellow p-3 rounded-none flex justify-between items-center text-left text-xs transition-all cursor-pointer text-retro-dark font-bold shadow-[1px_1px_0px_0px_rgba(17,24,39,1)]"
                      >
                        <span className="font-semibold">{player.name}</span>
                        <span className="font-mono text-[10px] text-retro-dark uppercase bg-retro-cream px-2 py-0.5 border border-retro-dark">
                          {player.position}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-gray-600 font-mono font-bold">No se encontraron jugadores disponibles.</div>
                  )
                ) : (
                  <div className="text-center py-4 text-xs text-gray-600 font-mono font-bold">Escribe un carácter para iniciar la búsqueda.</div>
                )}
              </div>

              <button
                onClick={() => setSelectedCell(null)}
                className="mt-6 text-xs font-mono text-retro-red hover:text-retro-dark font-bold uppercase tracking-wider self-center"
              >
                • CERRAR VENTANA •
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}