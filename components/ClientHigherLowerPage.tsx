// components/ClientHigherLowerPage.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Player } from '@/lib/definitions';
import PlayerCard from '@/components/PlayerCard';
import AdSenseScript from './AdSenseScript';

interface ClientHigherLowerPageProps {
  initialPlayers: Player[];
}

export default function ClientHigherLowerPage({ initialPlayers }: ClientHigherLowerPageProps) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Estados de los jugadores
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [nextPlayer, setNextPlayer] = useState<Player | null>(null);

  // Inicialización aleatoria al cargar el componente
  useEffect(() => {
    if (initialPlayers.length > 1) {
      const p1 = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
      let p2 = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
      while (p2.id === p1.id) {
        p2 = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
      }
      setCurrentPlayer(p1);
      setNextPlayer(p2);
      setIsReady(true);
    }
  }, [initialPlayers]);

  const handleGuess = (guess: 'HIGHER' | 'LOWER') => {
    if (gameOver || !currentPlayer || !nextPlayer) return;

    const isHigher = nextPlayer.rating >= currentPlayer.rating;
    const isLower = nextPlayer.rating <= currentPlayer.rating;
    const isCorrect = (guess === 'HIGHER' && isHigher) || (guess === 'LOWER' && isLower);

    if (isCorrect) {
      // Acierto
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) setHighScore(newScore);

      setCurrentPlayer(nextPlayer);
      let newNext = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
      while (newNext.id === nextPlayer.id || newNext.id === currentPlayer.id) {
        newNext = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
      }
      setNextPlayer(newNext);
    } else {
      // Fallo
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    const randomPlayer = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
    setCurrentPlayer(randomPlayer);
    let next = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
    while (next.id === randomPlayer.id) {
      next = initialPlayers[Math.floor(Math.random() * initialPlayers.length)];
    }
    setNextPlayer(next);
  };

  // Evitar renderizado prematuro antes de tener los jugadores
  if (!isReady || !currentPlayer || !nextPlayer) {
    return <div className="min-h-screen bg-retro-cream flex justify-center items-center font-mono font-bold">Cargando jugadores...</div>;
  }

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-6 flex flex-col items-center justify-center">
      <AdSenseScript />
      <div className="w-full max-w-2xl flex flex-col items-center">

        <header className="text-center mb-6">
          <h1 className="retro-heading font-black text-3xl text-retro-dark uppercase tracking-tighter">
            Higher or <span className="text-retro-green">Lower</span>
          </h1>
          <p className="text-xs text-gray-600 mt-2 font-mono font-bold">¿El jugador de la derecha tiene mayor o menor rating?</p>
        </header>

        {/* CONTADORES DE MARCADORES */}
        <div className="w-full max-w-md bg-white border-2 border-retro-dark rounded-none p-3 mb-6 flex justify-between font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
          <div className="text-retro-dark">Racha actual: <span className="text-retro-green">{score}</span></div>
          <div className="text-retro-dark">Racha máxima: <span className="text-retro-red">{highScore}</span></div>
        </div>

        {/* AREA DE COMPARACIÓN DE CROMOS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full mb-8">
          
          {/* JUGADOR ACTUAL (VISIBLE COMPLETAMENTE) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-gray-600 uppercase tracking-wider font-bold">Actual</span>
            <PlayerCard player={currentPlayer} hideRating={false} />
          </div>

          {/* DIVISOR DE ACCIONES DE INTERACCIÓN */}
          <div className="flex flex-col gap-3 min-w-[120px] justify-center items-center">
            {!gameOver ? (
              <>
                <button
                  onClick={() => handleGuess('HIGHER')}
                  className="retro-btn w-full bg-retro-green text-retro-cream text-xs"
                >
                  ▲ Mayor
                </button>
                <button
                  onClick={() => handleGuess('LOWER')}
                  className="retro-btn w-full bg-retro-red text-retro-cream text-xs"
                >
                  ▼ Menor
                </button>
              </>
            ) : (
              <div className="text-center p-3 bg-retro-red border-2 border-retro-dark rounded-none font-bold shadow-[3px_3px_0px_0px_rgba(17,24,39,1)]">
                <span className="text-xs text-retro-cream font-mono font-black block uppercase">Game Over</span>
                <span className="text-[10px] text-retro-cream block mt-2 font-mono">Rating de {nextPlayer.shortName} era {nextPlayer.rating}</span>
                <button
                  onClick={resetGame}
                  className="mt-3 bg-retro-cream text-retro-dark font-bold text-[10px] uppercase font-mono px-3 py-1.5 border-2 border-retro-dark rounded-none active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(17,24,39,0.5)]"
                >
                  Reiniciar
                </button>
              </div>
            )}
          </div>

          {/* JUGADOR OBJETIVO (OCULTO HASTA EL GAME OVER) */}
          <div className="flex flex-col items-center gap-2 relative">
            <span className="text-xs font-mono text-gray-600 uppercase tracking-wider font-bold">Objetivo</span>
            
            {/* Animación de feedback cuando se pierde */}
            {gameOver && (
               <span className="absolute -top-4 right-0 z-10 text-retro-red font-black text-xl animate-bounce">
                 {nextPlayer.rating}
               </span>
            )}
            
            {/* Ocultamos el rating si el juego sigue en curso (!gameOver = true) */}
            <PlayerCard player={nextPlayer} hideRating={!gameOver} />
          </div>

        </div>

      </div>
    </div>
  );
}