'use client';

import { useKonamiCode } from '@/hooks/useKonamiCode';

export default function KonamiProvider() {
  // Instanciamos el detector global en el cliente
  useKonamiCode();
  
  // Este componente no renderiza nada en el DOM
  return null; 
}