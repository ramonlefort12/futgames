// app/lib/utils.ts

import { Country } from '@/lib/definitions';

/**
 * Obtiene un array de 11 selecciones nacionales únicas y aleatorias.
 * * @param dataSet Array completo o Record indexado de todos los países disponibles.
 * @returns Array con 11 objetos de tipo Country completamente aleatorios y distintos.
 */
export function generateRandomCountriesForDraft(
  dataSet: Record<string, Country> | Country[]
): Country[] {
  const allCountries = Array.isArray(dataSet) 
    ? [...dataSet] 
    : Object.values(dataSet);

  const totalCountries = allCountries.length;

  if (totalCountries < 11) {
    throw new Error(
      `Fallo de consistencia: Se requieren mínimo 11 selecciones en el dataset y solo hay ${totalCountries}.`
    );
  }

  for (let i = 0; i < 11; i++) {
    const randomIndex = Math.floor(Math.random() * (totalCountries - i)) + i;
    const temp = allCountries[i];
    allCountries[i] = allCountries[randomIndex];
    allCountries[randomIndex] = temp;
  }

  return allCountries.slice(0, 11);
}