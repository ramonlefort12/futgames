// app/higher-lower/page.tsx
'use client';

import { useState } from 'react';
import { syne } from '@/app/ui/fonts';
import Link from 'next/link';
import { Player } from '@/app/lib/definitions';
import { playersData } from '@/app/lib/placeholder-data';
import PlayerCard from '@/app/ui/PlayerCard';

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
    const isCorrect = (guess === 'HIGHER' && isHigher) || (guess === 'LOWER' && !isHigher);

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
    <div className="min-h-screen bg-cyber-bg text-white p-4 md:p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center">
        
        <Link href="/" className="text-xs font-mono text-cyber-neon hover:underline mb-6 flex items-center gap-1 self-start">
          ← volver al campo
        </Link>

        <header className="text-center mb-6">
          <h1 className={`${syne.className} font-extrabold text-3xl text-white lowercase tracking-tighter`}>
            higher or <span className="text-cyber-neon">lower</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">¿El jugador de la derecha tiene mayor o menor rating?</p>
        </header>

        {/* CONTADORES DE MARCADORES */}
        <div className="w-full max-w-md bg-cyber-card border border-cyber-border rounded-xl p-3 mb-6 flex justify-between font-mono text-xs">
          <div>Racha actual: <span className="text-cyber-neon font-bold">{score}</span></div>
          <div>Racha máxima: <span className="text-white font-bold">{highScore}</span></div>
        </div>

        {/* AREA DE COMPARACIÓN DE CROMOS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full mb-8">
          
          {/* JUGADOR ACTUAL (VISIBLE) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Actual</span>
            <PlayerCard player={currentPlayer} size="lg" />
          </div>

          {/* DIVISOR DE ACCIONES DE INTERACCIÓN */}
          <div className="flex flex-col gap-3 min-w-[120px] justify-center items-center">
            {!gameOver ? (
              <>
                <button
                  onClick={() => handleGuess('HIGHER')}
                  className="w-full bg-cyber-neon text-black font-bold py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider neon-glow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  ▲ Mayor
                </button>
                <button
                  onClick={() => handleGuess('LOWER')}
                  className="w-full bg-cyber-card border border-cyber-border text-white font-bold py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-wider hover:border-red-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  ▼ Menor
                </button>
              </>
            ) : (
              <div className="text-center p-2 bg-red-500/10 border border-red-500 rounded-xl">
                <span className="text-xs text-red-500 font-mono font-bold block uppercase">Game Over</span>
                <span className="text-[10px] text-gray-400 block mt-1">Era {nextPlayer.name} ({nextPlayer.rating})</span>
                <button
                  onClick={resetGame}
                  className="mt-3 bg-white text-black font-bold text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reiniciar 🔄
                </button>
              </div>
            )}
          </div>

          {/* JUGADOR OBJETIVO (OCULTO/REVELADO) */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Objetivo</span>
            {gameOver ? (
              <PlayerCard player={nextPlayer} size="lg" />
            ) : (
              <div className="w-48 h-[272px] bg-cyber-card border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center">
                <span className={`${syne.className} text-4xl text-gray-700 font-extrabold`}>?</span>
                <span className="text-xs font-mono text-gray-500 mt-2 truncate max-w-[160px]">{nextPlayer.name}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}