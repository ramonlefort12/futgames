// app/trivia/page.tsx
import { getCountries, getAllPlayers } from '@/app/lib/data';
import ClientTriviaPage from '@/components/ClientTriviaPage';

export default async function TriviaPage() {
  // Descarga concurrente del dataset completo
  const [countriesRecord, playersArray] = await Promise.all([
    getCountries(),
    getAllPlayers(),
  ]);

  return (
    <ClientTriviaPage 
      initialCountries={countriesRecord} 
      initialPlayers={playersArray} 
    />
  );
}