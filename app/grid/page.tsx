// app/grid/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Player } from '@/lib/definitions';
import { playersData, countriesData } from '@/app/lib/placeholder-data';
import PlayerCard from '@/components/PlayerCard';

// 1. CONFIGURACIÓN DEL RETO DIARIO (Criterios fijos para filas y columnas)
const GRID_CRITERIOS = {
  // Filas (Y)
  rows: [
    { id: 'esp', name: 'España', type: 'COUNTRY' },
    { id: 'arg', name: 'Argentina', type: 'COUNTRY' },
    { id: 'bra', name: 'Brasil', type: 'COUNTRY' }
  ],
  // Columnas (X)
  cols: [
    { id: 'POR', name: 'Portero', type: 'POSITION' },
    { id: 'DFC', name: 'Defensa Central', type: 'POSITION' },
    { id: 'DC', name: 'Delantero', type: 'POSITION' }
  ]
};

// Matriz de respuestas correctas simuladas basada en nuestro placeholder-data.ts
// Clave compuesta por: "filaId-columnaId"
const VALID_ANSWERS_MAP: Record<string, string[]> = {
  'esp-POR': ['p-casillas'],
  'esp-DFC': ['p-pique'],
  'esp-DC': [], // Espacio para futuros fichajes estáticos
  'arg-POR': ['p-martinez'],
  'arg-DFC': ['p-romero'],
  'arg-DC': ['p-alvarez'],
  'bra-POR': ['p-alisson'],
  'bra-DFC': ['p-marquinhos'],
  'bra-DC': ['p-pele', 'p-r9']
};

export default function ImmaculateGridPage() {
  // Estado de las 9 celdas de la cuadrícula: Record<"filaIndex-colIndex", Player | null>
  const [gridState, setGridState] = useState<Record<string, Player | null>>({});
  
  // Estados para el flujo de selección
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(9); // 9 intentos máximos (estilo Wordle)
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');

  // Filtrado síncrono de jugadores en base a la búsqueda del input
  const filteredPlayers = playersData.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !Object.values(gridState).some(p => p?.id === player.id) // Evita repetir el mismo jugador en el tablero
  );

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

    const rowCriterio = GRID_CRITERIOS.rows[rowIndex];
    const colCriterio = GRID_CRITERIOS.cols[colIndex];

    // Validación Algorítmica Cruzada (Fila-Columna)
    const matchesRow = player.countryId === rowCriterio.id;
    const matchesCol = player.position === colCriterio.id;
    
    // Verificación manual por mapa indexado por si hay excepciones históricas de posiciones
    const explicitValidIds = VALID_ANSWERS_MAP[`${rowCriterio.id}-${colCriterio.id}`] || [];
    const isValid = (matchesRow && matchesCol) || explicitValidIds.includes(player.id);

    if (isValid) {
      // Acierto: Registramos el cromo en la matriz
      const newGridState = { ...gridState, [selectedCell]: player };
      setGridState(newGridState);

      // Verificamos si completó las 9 celdas correctamente
      if (Object.keys(newGridState).length === 9) {
        setGameStatus('WON');
      }
    } else {
      // Fallo: Restamos un intento de la cuota diaria
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      if (nextAttempts === 0) {
        setGameStatus('LOST');
      }
      alert(`¡Incorrecto! ${player.name} no cumple las condiciones de la celda.`);
    }

    setSelectedCell(null);
  };

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">
        
        {/* ENLACES DE CONTROL */}
        <Link href="/" className="text-xs font-mono text-retro-green hover:underline mb-6 flex items-center gap-1 self-start font-bold">
          ← volver al campo de juego
        </Link>

        {/* CABECERA */}
        <header className="mb-6">
          <h1 className="retro-heading font-black text-3xl tracking-tighter uppercase">
            Inmaculado <span className="text-retro-green">Grid</span>
          </h1>
          <p className="text-xs text-gray-600 font-mono mt-2 font-bold">
            Cruza países y posiciones. Tienes 9 intentos para resolver el tablero completo.
          </p>
        </header>

        {/* CONTADORES DE ESTADO */}
        <div className="bg-white border-2 border-retro-dark rounded-none p-3 mb-6 flex justify-between items-center text-xs font-mono font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
          <span className="text-retro-dark">Intentos disponibles:</span>
          <span className={`${attemptsLeft <= 3 ? 'text-retro-red' : 'text-retro-dark'} bg-retro-yellow px-2 py-0.5 border border-retro-dark`}>
            {attemptsLeft} / 9
          </span>
        </div>

        {/* MENSAJES DE FIN DE JUEGO */}
        {gameStatus === 'WON' && (
          <div className="bg-retro-yellow border-2 border-retro-dark text-retro-dark text-center rounded-none p-4 mb-4 text-sm font-bold font-mono uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(17,24,39,1)]">
            🏆 ¡TABLERO IMPECABLE COMPLETADO!
          </div>
        )}
        {gameStatus === 'LOST' && (
          <div className="bg-retro-red border-2 border-retro-dark text-retro-cream text-center rounded-none p-4 mb-4 text-sm font-bold font-mono uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(17,24,39,1)]">
            ❌ FIN DEL JUEGO - SIN INTENTOS
          </div>
        )}

        {/* LA REJILLA / GRID EN CSS GRID (Estructura 4x4 incluyendo cabeceras) */}
        <div className="grid grid-cols-4 gap-2 w-full aspect-square bg-white border-2 border-retro-dark rounded-none p-2 relative shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
          
          {/* Esquina superior izquierda vacía */}
          <div className="flex items-center justify-center text-[9px] font-mono text-retro-dark font-bold uppercase">
            futgames
          </div>

          {/* Cabeceras de las Columnas (X) */}
          {GRID_CRITERIOS.cols.map((col) => (
            <div key={col.id} className="flex items-center justify-center text-center bg-retro-yellow border-2 border-retro-dark rounded-none px-1 text-[10px] font-bold text-retro-dark font-mono uppercase">
              {col.name}
            </div>
          ))}

          {/* Renderizado de Filas con sus respectivas Celdas */}
          {GRID_CRITERIOS.rows.map((row, rowIndex) => (
            <div key={row.id || rowIndex} className="contents">
              {/* Cabecera de la Fila (Y) */}
              <div className="flex items-center justify-center text-[9px] font-mono font-bold text-retro-dark uppercase border-2 border-retro-dark bg-retro-yellow rounded-none">
                {row.name}
              </div>

              {/* 3 Celdas Interactivas por Fila */}
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

        {/* MODAL / DRAWER INTERACTIVO DE BÚSQUEDA DE JUGADORES */}
        {selectedCell !== null && (
          <div className="fixed inset-0 bg-retro-dark/80 flex flex-col justify-end sm:justify-center items-center z-50 p-4">
            <div className="w-full max-w-md bg-white border-3 border-retro-dark rounded-none p-6 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] flex flex-col">
              
              <header className="mb-4 border-b-2 border-retro-dark pb-3">
                <h3 className="text-sm font-mono text-retro-green font-bold uppercase tracking-wider">Adivinar Futbolista</h3>
                <p className="text-xs text-gray-600 mt-1 font-mono font-bold">Introduce el nombre de un jugador que cumpla ambos requisitos.</p>
              </header>

              {/* Input de Búsqueda Reactivo */}
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Casillas, Messi, R9..."
                className="w-full bg-retro-cream border-2 border-retro-dark rounded-none px-4 py-2 text-xs text-retro-dark focus:border-retro-dark focus:outline-none font-mono font-bold mb-4"
              />

              {/* Resultados del Filtro de Búsqueda */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {searchQuery.trim().length > 0 ? (
                  filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => (
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

              {/* Botón de Cierre */}
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