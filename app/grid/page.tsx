// app/grid/page.tsx
'use client';

import { useState } from 'react';
import { syne } from '@/app/ui/fonts';
import Link from 'next/link';
import { Player } from '@/app/lib/definitions';
import { playersData, countriesData } from '@/app/lib/placeholder-data';
import PlayerCard from '@/app/ui/PlayerCard';

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
    <div className="min-h-screen bg-cyber-bg text-white p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">
        
        {/* ENLACES DE CONTROL */}
        <Link href="/" className="text-xs font-mono text-cyber-neon hover:underline mb-6 flex items-center gap-1 self-start">
          ← volver al campo de juego
        </Link>

        {/* CABECERA */}
        <header className="mb-4">
          <h1 className={`${syne.className} font-extrabold text-3xl tracking-tighter lowercase`}>
            immaculate <span className="text-cyber-neon">grid</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Cruza países y posiciones. Tienes 9 intentos para resolver el tablero completo.
          </p>
        </header>

        {/* CONTADORES DE ESTADO */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-3 mb-6 flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400">Intentos disponibles:</span>
          <span className={`font-bold ${attemptsLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {attemptsLeft} / 9
          </span>
        </div>

        {/* MENSAJES DE FIN DE JUEGO */}
        {gameStatus === 'WON' && (
          <div className="bg-cyber-neon/10 border border-cyber-neon text-cyber-neon text-center rounded-xl p-4 mb-4 text-sm font-bold">
            🏆 ¡Tablero Impecable Completado! Eres un experto en estadísticas de fútbol.
          </div>
        )}
        {gameStatus === 'LOST' && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-center rounded-xl p-4 mb-4 text-sm font-bold">
            ❌ Fin del juego. Te has quedado sin intentos. ¡Mañana habrá un nuevo reto!
          </div>
        )}

        {/* LA REJILLA / GRID EN CSS GRID (Estructura 4x4 incluyendo cabeceras) */}
        <div className="grid grid-cols-4 gap-2 w-full aspect-square bg-black/20 border border-cyber-border rounded-2xl p-2 relative">
          
          {/* Esquina superior izquierda vacía */}
          <div className="flex items-center justify-center text-[9px] font-mono text-gray-600 uppercase">
            futgames
          </div>

          {/* Cabeceras de las Columnas (X) */}
          {GRID_CRITERIOS.cols.map((col) => (
            <div key={col.id} className="flex items-center justify-center text-center bg-cyber-card/40 border border-cyber-border/40 rounded-xl px-1 text-[10px] font-bold text-gray-300 font-mono">
              {col.name}
            </div>
          ))}

          {/* Renderizado de Filas con sus respectivas Celdas */}
          {GRID_CRITERIOS.rows.map((row, rowIndex) => (
            <div key={row.id || rowIndex} className="contents"> {/* O la clase de layout que uses */}
              {/* Cabecera de la Fila (Y) */}
              <div className="flex items-center justify-center ...">
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
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center border transition-all duration-200 overflow-hidden ${
                      solvedPlayer 
                        ? 'border-cyber-neon p-0 bg-transparent' 
                        : 'bg-cyber-card/80 border-dashed border-gray-700 hover:border-cyber-neon hover:bg-cyber-card cursor-pointer'
                    }`}
                  >
                    {solvedPlayer ? (
                      <PlayerCard player={solvedPlayer} size="sm" />
                    ) : (
                      <span className="text-gray-600 text-lg font-bold group-hover:text-white">+</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* MODAL / DRAWER INTERACTIVO DE BÚSQUEDA DE JUGADORES */}
        {selectedCell !== null && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center z-50 p-4">
            <div className="w-full max-w-md bg-cyber-card border border-cyber-border rounded-t-2xl sm:rounded-2xl p-6 neon-glow-sm flex flex-col">
              
              <header className="mb-4">
                <h3 className="text-sm font-mono text-cyber-neon uppercase tracking-wider font-bold">Adivinar Futbolista</h3>
                <p className="text-xs text-gray-400 mt-1">Introduce el nombre de un jugador que cumpla ambos requisitos.</p>
              </header>

              {/* Input de Búsqueda Reactivo */}
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Casillas, Messi, R9..."
                className="w-full bg-black/40 border border-cyber-border rounded-xl px-4 py-3 text-sm text-white focus:border-cyber-neon focus:outline-none font-sans mb-4"
              />

              {/* Resultados del Filtro de Búsqueda */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {searchQuery.trim().length > 0 ? (
                  filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleGuessPlayer(player)}
                        className="w-full bg-black/20 border border-cyber-border/60 hover:border-cyber-neon p-3 rounded-xl flex justify-between items-center text-left text-xs transition-all cursor-pointer text-white"
                      >
                        <span className="font-semibold">{player.name}</span>
                        <span className="font-mono text-[10px] text-gray-400 uppercase bg-cyber-card px-2 py-0.5 rounded">
                          {player.position}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-gray-500 font-mono">No se encontraron jugadores disponibles.</div>
                  )
                ) : (
                  <div className="text-center py-4 text-xs text-gray-500 font-mono">Escribe un carácter para iniciar la búsqueda.</div>
                )}
              </div>

              {/* Botón de Cierre */}
              <button
                onClick={() => setSelectedCell(null)}
                className="mt-6 text-xs font-mono text-gray-500 hover:text-white uppercase tracking-wider self-center"
              >
                • Cerrar Ventana •
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}