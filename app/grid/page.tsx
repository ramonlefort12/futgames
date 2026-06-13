// app/grid/page.tsx
import { getAllPlayers, getCountries, getPositions } from '@/app/lib/data';
import ClientGridPage from '@/components/ClientGridPage';

export default async function ImmaculateGridPage() {
  // Promise.all permite hacer las 3 consultas simultáneamente, reduciendo el tiempo
  // de respuesta al tiempo de la consulta más lenta, en lugar de sumar las tres.
  const [playersArray, countriesRecord, positionsArray] = await Promise.all([
    getAllPlayers(),
    getCountries(),
    getPositions()
  ]);

  // Transformamos el Record de países en un Array iterar más fácil en el cliente
  const countriesArray = Object.values(countriesRecord);

  return (
    <ClientGridPage 
      initialPlayers={playersArray} 
      initialCountries={countriesArray}
      initialPositions={positionsArray}
    />
  );
}