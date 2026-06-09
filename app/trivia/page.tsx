// app/trivia/page.tsx
'use client';

import { useState } from 'react';
import { syne } from '@/app/ui/fonts';
import Link from 'next/link';
import { Player } from '@/app/lib/definitions';
import { playersData, countriesData } from '@/app/lib/placeholder-data';

export default function TriviaPage() {
  const [gameIndex, setGameIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'PLAYING' | 'CORRECT' | 'WRONG' | 'FINISHED'>('PLAYING');

  // Selección secuencial de jugadores del dataset para adivinar
  const targetPlayer: Player = playersData[gameIndex % playersData.length];
  const associatedCountry = countriesData[targetPlayer.countryId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'PLAYING') return;

    // Normalización de cadenas de texto para evitar fallos por tildes o mayúsculas
    const cleanUser = userAnswer.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanTarget = targetPlayer.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Validamos si el string ingresado está incluido en el nombre real (permite apellidos)
    if (cleanTarget.includes(cleanUser) && cleanUser.length > 2) {
      setScore(score + 1);
      setStatus('CORRECT');
    } else {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives === 0) {
        setStatus('FINISHED');
      } else {
        setStatus('WRONG');
      }
    }
  };

  const advanceNextRound = () => {
    setUserAnswer('');
    setStatus('PLAYING');
    setGameIndex((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-white p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">
        
        <Link href="/" className="text-xs font-mono text-cyber-neon hover:underline mb-6 flex items-center gap-1 self-start">
          ← volver al campo
        </Link>

        <header className="mb-6">
          <h1 className={`${syne.className} font-extrabold text-3xl text-white lowercase tracking-tighter`}>
            trivia de <span className="text-cyber-neon">fichajes</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Adivina el futbolista oculto cruzando las pistas de su ficha técnica.</p>
        </header>

        {/* MARCADORES */}
        <div className="bg-cyber-card border border-cyber-border rounded-xl p-3 mb-6 flex justify-between font-mono text-xs">
          <div>Puntos: <span className="text-cyber-neon font-bold">{score}</span></div>
          <div>Vidas restantes: <span className="text-red-500 font-bold">{'❤️ '.repeat(lives)}</span></div>
        </div>

        {/* PANEL DE PISTAS DE TRANSFERENCIA */}
        {status !== 'FINISHED' ? (
          <section className="bg-cyber-card border border-cyber-border rounded-2xl p-6 neon-glow-sm flex flex-col gap-4 mb-6">
            <h3 className="text-xs font-mono uppercase text-gray-400 tracking-wider">• Ficha del Jugador •</h3>
            
            <div className="flex flex-col gap-3 font-sans text-sm">
              <div className="flex justify-between border-b border-cyber-border/40 pb-2">
                <span className="text-gray-400">Nacionalidad:</span>
                <span className="font-bold text-white">{associatedCountry?.name || 'Internacional'}</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/40 pb-2">
                <span className="text-gray-400">Posición Natural:</span>
                <span className="font-bold text-cyber-neon font-mono uppercase">{targetPlayer.position}</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/40 pb-2">
                <span className="text-gray-400">Valoración General (OVR):</span>
                <span className="font-bold text-white font-mono">{targetPlayer.rating}</span>
              </div>
            </div>

            {/* FEEDBACK DIRECTO EN EL PANEL */}
            {status === 'CORRECT' && (
              <div className="p-3 bg-cyber-neon/10 border border-cyber-neon text-cyber-neon text-xs rounded-xl font-bold text-center">
                ¡Correcto! Era {targetPlayer.name}.
              </div>
            )}
            {status === 'WRONG' && (
              <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs rounded-xl font-bold text-center">
                ❌ Respuesta incorrecta. ¡Pierdes una vida!
              </div>
            )}

            {/* FORMULARIO DE RESPUESTA */}
            {status === 'PLAYING' ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
                <input
                  type="text"
                  required
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Escribe el nombre o apellido..."
                  className="w-full bg-black/40 border border-cyber-border rounded-xl px-4 py-3 text-sm focus:border-cyber-neon focus:outline-none text-white"
                />
                <button type="submit" className="w-full bg-cyber-neon text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer">
                  Enviar Respuesta
                </button>
              </form>
            ) : (
              <button onClick={advanceNextRound} className="w-full bg-white text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono transition-transform hover:scale-[1.01]">
                Siguiente Jugador ➜
              </button>
            )}
          </section>
        ) : (
          <div className="w-full bg-cyber-card border border-red-500 text-center p-6 rounded-2xl neon-glow-sm">
            <h3 className={`${syne.className} text-xl text-red-500 font-bold`}>GAME OVER</h3>
            <p className="text-xs text-gray-400 mt-2">Te has quedado sin vidas. Tu récord final es de {score} puntos.</p>
            <button onClick={() => { setLives(3); setScore(0); setGameIndex(0); setStatus('PLAYING'); setUserAnswer(''); }} className="mt-6 w-full bg-white text-black font-bold py-3 rounded-xl text-xs uppercase tracking-wider font-mono">
              Intentarlo de Nuevo 🔄
            </button>
          </div>
        )}

      </div>
    </div>
  );
}