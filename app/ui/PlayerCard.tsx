// app/ui/PlayerCard.tsx
'use client';

import { Player } from '@/app/lib/definitions';
import { syne } from '@/app/ui/fonts';

// Mapeo estricto de estilos visuales por rareza para evitar lógica difusa en el renderizado
const RARITY_STYLES = {
  COMMON: {
    bg: 'bg-gradient-to-b from-[#21262D] to-[#161B22]',
    border: 'border-[#30363D]',
    text: 'text-[#8B949E]',
    glow: '',
    badge: 'bg-[#30363D] text-[#8B949E]'
  },
  SILVER: {
    bg: 'bg-gradient-to-b from-[#485563] to-[#29323C]',
    border: 'border-[#8E9EAB]',
    text: 'text-[#E6EDF3]',
    glow: 'shadow-[0_0_15px_rgba(142,158,171,0.15)]',
    badge: 'bg-[#8E9EAB] text-black'
  },
  GOLD: {
    bg: 'bg-gradient-to-b from-[#2D2206] to-[#161203]',
    border: 'border-[#F5AF19]',
    text: 'text-[#F5AF19]',
    glow: 'shadow-[0_0_20px_rgba(245,175,25,0.25)]',
    badge: 'bg-[#F5AF19] text-black'
  },
  LEGEND: {
    bg: 'bg-gradient-to-b from-[#002B11] to-[#0D1117]',
    border: 'border-[#00FF66]',
    text: 'text-[#00FF66]',
    glow: 'neon-glow-sm hover:neon-glow-lg',
    badge: 'bg-[#00FF66] text-black animate-pulse'
  },
  MEME: {
    bg: 'bg-gradient-to-b from-[#330011] to-[#0D1117]',
    border: 'border-[#FF0055]',
    text: 'text-[#FF0055]',
    glow: 'shadow-[0_0_25px_rgba(255,0,85,0.35)] animate-cyber-pulse',
    badge: 'bg-[#FF0055] text-white font-mono'
  }
};

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function PlayerCard({ player, onClick, size = 'md' }: PlayerCardProps) {
  const styles = RARITY_STYLES[player.rarity] || RARITY_STYLES.COMMON;

  // Escala de dimensiones responsive controlada por props
  const sizeClasses = {
    sm: 'w-24 h-36 text-xs p-2',
    md: 'w-36 h-52 text-sm p-3',
    lg: 'w-48 h-68 text-base p-4'
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${styles.bg}
        ${styles.border}
        ${styles.glow}
        border-2
        rounded-xl
        relative
        flex
        flex-col
        justify-between
        transition-all
        duration-300
        cursor-pointer
        select-none
        hover:scale-105
        active:scale-95
      `}
    >
      {/* Esquina Superior Izquierda: Media (Rating) y Posición */}
      <div className="flex flex-col items-start leading-none">
        <span className={`${syne.className} font-extrabold text-xl md:text-2xl ${styles.text}`}>
          {player.rating}
        </span>
        <span className="text-[10px] font-mono text-gray-400 font-bold uppercase mt-0.5">
          {player.position}
        </span>
      </div>

      {/* Contenedor Central: Identificador Visual / Silueta del Jugador */}
      <div className="w-full flex justify-center items-center flex-grow my-2">
        {player.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={player.imageUrl} 
            alt={player.name} 
            className="h-20 object-contain pointer-events-none"
          />
        ) : (
          // Silueta vectorial fallback optimizada por CSS (cero peticiones de red)
          <div className={`opacity-20 ${styles.text}`}>
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Sección Inferior: Nombre y Badge de Tipo de Carta */}
      <div className="w-full text-center">
        <div className={`truncate font-semibold text-white tracking-tight ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          {player.name}
        </div>
        
        {/* Badge Semántico que denota la categoría de la carta */}
        <div className={`
          mt-1.5 
          inline-block 
          rounded 
          font-sans 
          font-bold 
          uppercase 
          tracking-wider
          text-[8px]
          px-1.5
          py-0.5
          ${styles.badge}
        `}>
          {player.rarity === 'MEME' ? '⚠️ meme' : player.rarity.toLowerCase()}
        </div>
      </div>
    </div>
  );
}