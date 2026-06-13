// app/higher-lower/page.tsx
import { getAllPlayers } from '@/app/lib/data';
import ClientHigherLowerPage from '@/components/ClientHigherLowerPage';

export default async function HigherLowerPage() {
  // Obtenemos los jugadores directamente de la BD Neon
  const playersArray = await getAllPlayers();

  return <ClientHigherLowerPage initialPlayers={playersArray} />;
}