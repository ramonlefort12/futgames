// app/lib/utils.ts

import { Country } from './definitions';
import { countriesData } from './placeholder-data';

/**
 * Obtiene un array de 11 selecciones nacionales únicas y aleatorias.
 * Utiliza el algoritmo de Fisher-Yates Shuffle para garantizar una 
 * distribución uniforme y óptima en tiempo O(N).
 * * @returns Array con 11 objetos de tipo Country completamente aleatorios y distintos.
 */
export function generateRandomCountriesForDraft(): Country[] {
  // 1. Transformamos nuestro diccionario indexado en un array de trabajo
  const allCountries = Object.values(countriesData);
  const totalCountries = allCountries.length;

  // Control de aserción técnica preventiva
  if (totalCountries < 11) {
    throw new Error(
      `Fallo de consistencia: Se requieren mínimo 11 selecciones en el dataset y solo hay ${totalCountries}.`
    );
  }

  // 2. Aplicamos Fisher-Yates parcial (solo barajamos los primeros 11 elementos)
  // Esto reduce operaciones innecesarias si el dataset crece a 100+ países.
  for (let i = 0; i < 11; i++) {
    // Generar un índice aleatorio entre el elemento actual 'i' y el final del array
    const randomIndex = Math.floor(Math.random() * (totalCountries - i)) + i;

    // Intercambio de posiciones (Swap) en la memoria del array
    const temp = allCountries[i];
    allCountries[i] = allCountries[randomIndex];
    allCountries[randomIndex] = temp;
  }

  // 3. Extraemos exactamente los primeros 11 países ya barajados de forma única
  return allCountries.slice(0, 11);
}