// app/lib/useKonamiCode.ts
'use client';

import { useEffect, useState } from 'react';

// Secuencia oficial del Código Konami usando los valores nativos de e.key
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function useKonamiCode() {
  const [isRetroActive, setIsRetroActive] = useState(false);

  useEffect(() => {
    let inputBuffer: string[] = [];

    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Añadimos la tecla presionada al buffer
      inputBuffer.push(event.key);

      // 2. Recortamos el buffer para mantener solo la longitud del código secreto
      if (inputBuffer.length > KONAMI_CODE.length) {
        inputBuffer.shift();
      }

      // 3. Comparamos de forma estricta los elementos del buffer con el código Konami
      const isMatch = inputBuffer.every((key, index) => key === KONAMI_CODE[index]);

      if (isMatch && inputBuffer.length === KONAMI_CODE.length) {
        setIsRetroActive((prev) => {
          const nextState = !prev;
          
          // 4. Manipulación del DOM perimetral para inyectar/remover la clase retro global
          if (nextState) {
            document.documentElement.classList.add('retro-mode');
            console.log('🎮 [FOOTGAMES LOG]: Código Konami activado. Iniciando emulación gráfica de 8 bits.');
          } else {
            document.documentElement.classList.remove('retro-mode');
            console.log('🎮 [FOOTGAMES LOG]: Código Konami desactivado. Volviendo a UI Cyber-Pitch.');
          }
          
          return nextState;
        });
        
        // Vaciamos el buffer tras la activación exitosa
        inputBuffer = [];
      }
    };

    // Escuchador nativo global en el objeto window
    window.addEventListener('keydown', handleKeyDown);

    // Saneamiento de eventos para evitar fugas de memoria al desmontar componentes
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return isRetroActive;
}