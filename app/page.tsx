// app/page.tsx
import { getCountries, getAllPlayers, getRivalTeams } from '@/app/lib/data';
import ClientHomePage from '@/components/ClientHomePage';

export default async function Page() {
  // Añadimos getRivalTeams() a las peticiones en paralelo
  const [countriesRecord, playersArray, rivalsArray] = await Promise.all([
    getCountries(),
    getAllPlayers(),
    getRivalTeams()
  ]);

  // Transformamos el Record de países a un Array
  const countriesArray = Object.values(countriesRecord);

  // Inyectamos los tres conjuntos de datos al componente cliente
  return (
    <ClientHomePage 
      initialCountries={countriesArray} 
      initialPlayers={playersArray} 
      initialRivals={rivalsArray}
    />
  );
}