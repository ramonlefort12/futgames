// components/ClientTriviaPage.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Player, Country } from '@/lib/definitions';
import AdSenseScript from './AdSenseScript';

interface ClientTriviaPageProps {
  initialCountries: Record<string, Country>;
  initialPlayers: Player[];
}

export default function ClientTriviaPage({ initialCountries, initialPlayers }: ClientTriviaPageProps) {
  // Estados del juego
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [status, setStatus] = useState<'PLAYING' | 'CORRECT' | 'WRONG' | 'FINISHED' | 'LOADING'>('LOADING');

  // Inicialización aleatoria (Fisher-Yates)
  useEffect(() => {
    if (initialPlayers.length > 0) {
      const shuffled = [...initialPlayers].sort(() => Math.random() - 0.5);
      setAvailablePlayers(shuffled);
      setTargetPlayer(shuffled[0]);
      setStatus('PLAYING');
    }
  }, [initialPlayers]);

  const associatedCountry = targetPlayer ? initialCountries[targetPlayer.countryId] : null;

  // Lógica de Pistas Estructurales
  const hintData = useMemo(() => {
    if (!targetPlayer) return null;

    // 1. Ahorcado: Reemplaza letras por '_', mantiene puntuación y espacios
    const hangmanMask = targetPlayer.shortName
      .split('')
      .map(char => {
        if (/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(char)) return '_';
        if (char === ' ') return '  '; 
        return char;
      })
      .join(' ');

    // 2. Extracción de datos del apellido
    const nameParts = targetPlayer.shortName.split(/[\s.]+/).filter(Boolean);
    const lastName = nameParts[nameParts.length - 1] || targetPlayer.shortName;

    return {
      hangman: hangmanMask,
      lastNameInitial: lastName.charAt(0).toUpperCase(),
      lastNameLength: lastName.length,
      nickname: targetPlayer.nickname
    };
  }, [targetPlayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'PLAYING' || !targetPlayer) return;

    const cleanUser = userAnswer.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanTarget = targetPlayer.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleanShort = targetPlayer.shortName.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Validación flexible: Coincidencia con nombre completo o nombre corto
    if ((cleanTarget.includes(cleanUser) || cleanShort.includes(cleanUser)) && cleanUser.length > 2) {
      // Penalización de puntuación según las pistas usadas
      const pointsEarned = Math.max(1, 4 - hintsRevealed);
      setScore(score + pointsEarned);
      setStatus('CORRECT');
    } else {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives === 0) {
        setStatus('FINISHED');
      } else {
        setStatus('WRONG');
        setTimeout(() => setStatus('PLAYING'), 1500); // Pequeña pausa de UX
      }
    }
    setUserAnswer('');
  };

  const advanceNextRound = () => {
    const nextAvailable = availablePlayers.slice(1);
    
    // Si agotamos la bolsa, volvemos a barajar el catálogo completo
    if (nextAvailable.length === 0) {
      const reshuffled = [...initialPlayers].sort(() => Math.random() - 0.5);
      setAvailablePlayers(reshuffled);
      setTargetPlayer(reshuffled[0]);
    } else {
      setAvailablePlayers(nextAvailable);
      setTargetPlayer(nextAvailable[0]);
    }

    setUserAnswer('');
    setHintsRevealed(0);
    setStatus('PLAYING');
  };

  const restartGame = () => {
    const reshuffled = [...initialPlayers].sort(() => Math.random() - 0.5);
    setAvailablePlayers(reshuffled);
    setTargetPlayer(reshuffled[0]);
    setLives(3);
    setScore(0);
    setHintsRevealed(0);
    setUserAnswer('');
    setStatus('PLAYING');
  };

  if (status === 'LOADING' || !targetPlayer || !hintData) {
    return <div className="min-h-screen bg-retro-cream flex items-center justify-center font-mono font-bold">Cargando base de datos...</div>;
  }

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-6 flex flex-col items-center">
      <AdSenseScript />
      <div className="w-full max-w-md flex flex-col">

        <header className="mb-6">
          <h1 className="retro-heading font-black text-3xl text-retro-dark uppercase tracking-tighter">
            Trivia de <span className="text-retro-green">Fichajes</span>
          </h1>
          <p className="text-xs text-gray-600 mt-2 font-mono font-bold">Adivina el futbolista oculto. Menos pistas = Más puntos.</p>
        </header>

        {/* MARCADORES */}
        <div className="bg-white border-2 border-retro-dark rounded-none p-3 mb-6 flex justify-between font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
          <div className="text-retro-dark">Puntos: <span className="text-retro-green">{score}</span></div>
          <div className="text-retro-dark">Vidas: <span className="text-retro-red">{'❤️ '.repeat(lives)}</span></div>
        </div>

        {status !== 'FINISHED' ? (
          <section className="bg-white border-3 border-retro-dark rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] flex flex-col gap-4 mb-6">
            <h3 className="text-xs font-mono uppercase text-gray-600 tracking-wider font-bold border-b-2 border-retro-dark pb-2">• FICHA DEL JUGADOR •</h3>
            
            <div className="flex flex-col gap-3 font-mono text-sm font-bold">
              <div className="flex justify-between border-b-2 border-retro-dark/30 pb-2">
                <span className="text-retro-dark">Nacionalidad:</span>
                <span className="text-retro-green">{associatedCountry?.name || 'Internacional'}</span>
              </div>
              <div className="flex justify-between border-b-2 border-retro-dark/30 pb-2">
                <span className="text-retro-dark">Posición:</span>
                <span className="text-retro-red font-mono uppercase">{targetPlayer.position}</span>
              </div>
              <div className="flex justify-between border-b-2 border-retro-dark/30 pb-2">
                <span className="text-retro-dark">OVR:</span>
                <span className="text-retro-green font-mono">{targetPlayer.rating}</span>
              </div>

              {/* SISTEMA DE PISTAS DESPLEGABLE */}
              <div className="mt-2 flex flex-col gap-2">
                {hintsRevealed >= 1 && (
                  <div className="flex justify-between bg-retro-cream p-2 border border-retro-dark/20 text-xs">
                    <span>Estructura:</span>
                    <span className="tracking-[0.2em]">{hintData.hangman}</span>
                  </div>
                )}
                {hintsRevealed >= 2 && (
                  <div className="flex justify-between bg-retro-cream p-2 border border-retro-dark/20 text-xs">
                    <span>Apellido:</span>
                    <span>Empieza por '{hintData.lastNameInitial}' ({hintData.lastNameLength} letras)</span>
                  </div>
                )}
                {hintsRevealed >= 3 && (
                  <div className="flex justify-between bg-retro-cream p-2 border border-retro-dark/20 text-xs">
                    <span>Apodo:</span>
                    <span className="text-retro-red">{hintData.nickname || 'Sin apodo conocido'}</span>
                  </div>
                )}

                {hintsRevealed < 3 && status === 'PLAYING' && (
                  <button 
                    onClick={() => setHintsRevealed(prev => prev + 1)}
                    className="mt-2 text-[10px] uppercase tracking-wider text-retro-dark border-2 border-dashed border-retro-dark py-1.5 hover:bg-retro-yellow transition-colors"
                  >
                    🔍 Revelar Pista {hintsRevealed + 1} (-1 Puntos potenciales)
                  </button>
                )}
              </div>
            </div>

            {/* FEEDBACK DIRECTO */}
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

            {/* FORMULARIO */}
            {status === 'PLAYING' || status === 'WRONG' ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
                <input
                  type="text"
                  required
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Escribe el nombre o apellido..."
                  className="w-full bg-retro-cream border-2 border-retro-dark rounded-none px-4 py-3 text-sm focus:border-retro-dark focus:outline-none text-retro-dark font-mono font-bold"
                  disabled={status === 'WRONG'}
                />
                <button type="submit" disabled={status === 'WRONG'} className="retro-btn w-full text-sm bg-retro-green text-retro-cream disabled:opacity-50">
                  Adivinar Jugador
                </button>
              </form>
            ) : (
              <button onClick={advanceNextRound} className="retro-btn w-full text-sm bg-retro-dark text-retro-cream mt-2">
                Siguiente Jugador ➜
              </button>
            )}
          </section>
        ) : (
          <div className="w-full bg-white border-3 border-retro-dark text-center p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
            <h3 className="retro-heading text-2xl text-retro-red font-black uppercase">GAME OVER</h3>
            <p className="text-xs text-gray-600 mt-3 font-mono font-bold">
              Te has quedado sin vidas.<br />Tu récord final es de <span className="text-retro-green font-black text-base">{score}</span> puntos.
            </p>
            <div className="mt-4 p-3 bg-retro-cream border border-retro-dark/20 text-xs font-mono">
              El jugador era: <br/><strong className="text-retro-dark text-sm">{targetPlayer.name}</strong>
            </div>
            <button onClick={restartGame} className="mt-6 retro-btn w-full bg-retro-green text-retro-cream text-sm">
              Intentarlo de Nuevo 🔄
            </button>
          </div>
        )}

      </div>
    </div>
  );
}