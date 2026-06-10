// app/higher-lower/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Player } from '@/lib/definitions';
import { playersData } from '@/app/lib/placeholder-data';
import PlayerCard from '@/components/PlayerCard';

export default function HigherLowerPage() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Guardamos el jugador actual (izq) y el siguiente objetivo (der)
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => {
    return playersData[Math.floor(Math.random() * playersData.length)];
  });
  const [nextPlayer, setNextPlayer] = useState<Player>(() => {
    let next = playersData[Math.floor(Math.random() * playersData.length)];
    while (next.id === currentPlayer.id) {
      next = playersData[Math.floor(Math.random() * playersData.length)];
    }
    return next;
  });

  const handleGuess = (guess: 'HIGHER' | 'LOWER') => {
    if (gameOver) return;

    const isHigher = nextPlayer.rating >= currentPlayer.rating;
    const isLower = nextPlayer.rating <= currentPlayer.rating;
    const isCorrect = (guess === 'HIGHER' && isHigher) || (guess === 'LOWER' && isLower);

    if (isCorrect) {
      // Acierto: Sumamos punto, el objetivo pasa a ser el actual y sorteamos uno nuevo
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) setHighScore(newScore);

      setCurrentPlayer(nextPlayer);
      let newNext = playersData[Math.floor(Math.random() * playersData.length)];
      while (newNext.id === nextPlayer.id || newNext.id === currentPlayer.id) {
        newNext = playersData[Math.floor(Math.random() * playersData.length)];
      }
      setNextPlayer(newNext);
    } else {
      // Fallo: Fin de la racha
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    const randomPlayer = playersData[Math.floor(Math.random() * playersData.length)];
    setCurrentPlayer(randomPlayer);
    let next = playersData[Math.floor(Math.random() * playersData.length)];
    while (next.id === randomPlayer.id) {
      next = playersData[Math.floor(Math.random() * playersData.length)];
    }
    setNextPlayer(next);
  };

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        <Link href="/" className="text-xs font-mono text-retro-green hover:underline mb-6 flex items-center gap-1 self-start font-bold">
          ← volver al campo
        </Link>

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
          
          {/* JUGADOR ACTUAL (VISIBLE) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-gray-600 uppercase tracking-wider font-bold">Actual</span>
            <PlayerCard player={currentPlayer} />
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
                <span className="text-[10px] text-retro-cream block mt-2 font-mono">Era {nextPlayer.name} ({nextPlayer.rating})</span>
                <button
                  onClick={resetGame}
                  className="mt-3 bg-retro-cream text-retro-dark font-bold text-[10px] uppercase font-mono px-3 py-1.5 border-2 border-retro-dark rounded-none"
                >
                  Reiniciar
                </button>
              </div>
            )}
          </div>

          {/* JUGADOR OBJETIVO (OCULTO/REVELADO) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-gray-600 uppercase tracking-wider font-bold">Objetivo</span>
            {gameOver ? (
              <PlayerCard player={nextPlayer} />
            ) : (
              <div className="w-full max-w-[200px] aspect-[3/4] bg-retro-cream border-3 border-dashed border-retro-dark rounded-none flex flex-col items-center justify-center shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                <span className="text-5xl font-black text-retro-yellow">?</span>
                <span className="text-xs font-mono text-retro-dark mt-2 truncate max-w-[160px] font-bold px-2 text-center">{nextPlayer.name}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}