// app/trivia/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Player } from '@/lib/definitions';
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
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-6 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">
        
        <Link href="/" className="text-xs font-mono text-retro-green hover:underline mb-6 flex items-center gap-1 self-start font-bold">
          ← volver al campo
        </Link>

        <header className="mb-6">
          <h1 className="retro-heading font-black text-3xl text-retro-dark uppercase tracking-tighter">
            Trivia de <span className="text-retro-green">Fichajes</span>
          </h1>
          <p className="text-xs text-gray-600 mt-2 font-mono font-bold">Adivina el futbolista oculto cruzando las pistas de su ficha técnica.</p>
        </header>

        {/* MARCADORES */}
        <div className="bg-white border-2 border-retro-dark rounded-none p-3 mb-6 flex justify-between font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
          <div className="text-retro-dark">Puntos: <span className="text-retro-green">{score}</span></div>
          <div className="text-retro-dark">Vidas: <span className="text-retro-red">{'❤️ '.repeat(lives)}</span></div>
        </div>

        {/* PANEL DE PISTAS DE TRANSFERENCIA */}
        {status !== 'FINISHED' ? (
          <section className="bg-white border-3 border-retro-dark rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] flex flex-col gap-4 mb-6">
            <h3 className="text-xs font-mono uppercase text-gray-600 tracking-wider font-bold border-b-2 border-retro-dark pb-2">• FICHA DEL JUGADOR •</h3>
            
            <div className="flex flex-col gap-3 font-mono text-sm font-bold">
              <div className="flex justify-between border-b-2 border-retro-dark pb-2">
                <span className="text-retro-dark">Nacionalidad:</span>
                <span className="text-retro-green">{associatedCountry?.name || 'Internacional'}</span>
              </div>
              <div className="flex justify-between border-b-2 border-retro-dark pb-2">
                <span className="text-retro-dark">Posición Natural:</span>
                <span className="text-retro-red font-mono uppercase">{targetPlayer.position}</span>
              </div>
              <div className="flex justify-between border-b-2 border-retro-dark pb-2">
                <span className="text-retro-dark">Valoración General (OVR):</span>
                <span className="text-retro-green font-mono">{targetPlayer.rating}</span>
              </div>
            </div>

            {/* FEEDBACK DIRECTO EN EL PANEL */}
            {status === 'CORRECT' && (
              <div className="p-3 bg-retro-yellow border-2 border-retro-dark text-retro-dark text-xs rounded-none font-bold text-center font-mono uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                ✓ ¡Correcto! Era {targetPlayer.name}.
              </div>
            )}
            {status === 'WRONG' && (
              <div className="p-3 bg-retro-red border-2 border-retro-dark text-retro-cream text-xs rounded-none font-bold text-center font-mono uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                ❌ INCORRECTO - ¡PIERDES UNA VIDA!
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
                  className="w-full bg-retro-cream border-2 border-retro-dark rounded-none px-4 py-3 text-sm focus:border-retro-dark focus:outline-none text-retro-dark font-mono font-bold"
                />
                <button type="submit" className="retro-btn w-full text-sm bg-retro-green text-retro-cream">
                  Enviar Respuesta
                </button>
              </form>
            ) : (
              <button onClick={advanceNextRound} className="retro-btn w-full text-sm bg-retro-yellow text-retro-dark">
                Siguiente Jugador ➜
              </button>
            )}
          </section>
        ) : (
          <div className="w-full bg-white border-3 border-retro-dark text-center p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
            <h3 className="retro-heading text-2xl text-retro-red font-black uppercase">GAME OVER</h3>
            <p className="text-xs text-gray-600 mt-3 font-mono font-bold">Te has quedado sin vidas.<br />Tu récord final es de <span className="text-retro-green font-black text-base">{score}</span> puntos.</p>
            <button onClick={() => { setLives(3); setScore(0); setGameIndex(0); setStatus('PLAYING'); setUserAnswer(''); }} className="mt-6 retro-btn w-full bg-retro-green text-retro-cream text-sm">
              Intentarlo de Nuevo 🔄
            </button>
          </div>
        )}

      </div>
    </div>
  );
}