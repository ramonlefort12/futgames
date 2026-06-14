// app/stats/page.tsx
import { getCountryStats } from '@/app/lib/data';
import { CountryStat } from '@/lib/definitions';
import StatsSearch from './StatsSearch';
import AdSenseScript from '@/components/AdSenseScript';

// Forzamos la revalidación dinámica
export const revalidate = 0;

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  // En Next.js 15 los parámetros de búsqueda deben resolverse con await
  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || '';
  
  let countriesRanking: CountryStat[] = [];
  let errorMsg = '';

  try {
    countriesRanking = await getCountryStats(query);
  } catch (err: any) {
    console.error('Error del servidor leyendo el ranking:', err);
    errorMsg = 'No se pudo conectar con el servidor de clasificaciones.';
  }

  // Métricas agregadas
  const totalGlobalTitles = countriesRanking.reduce((sum, country) => sum + Number(country.tournamentTitles), 0);
  const totalGlobalPlayed = countriesRanking.reduce((sum, country) => sum + Number(country.tournamentsPlayed), 0);

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-8 flex flex-col items-center">
      <AdSenseScript />
      <div className="w-full max-w-xl flex flex-col">

        <header className="mb-6">
          <h1 className="retro-heading font-black text-3xl tracking-tighter text-retro-dark uppercase">
            Palmarés <span className="text-retro-green">Mundial</span>
          </h1>
          <p className="text-xs text-gray-600 mt-2 font-mono font-bold">
            Historial colectivo en tiempo real de torneos conquistados por comunidad.
          </p>
        </header>

        {/* COMPONENTE CLIENTE DE BÚSQUEDA */}
        <StatsSearch />

        <section className="bg-white border-2 border-retro-dark rounded-none p-4 mb-6 flex justify-between items-center text-xs font-mono font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
          <div>
            <span className="text-gray-600 block uppercase text-[9px] tracking-wider">Torneos Jugados</span>
            <span className="text-retro-dark font-black text-base">{totalGlobalPlayed}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 block uppercase text-[9px] tracking-wider">Títulos Repartidos</span>
            <span className="text-retro-green font-black text-base">{totalGlobalTitles}</span>
          </div>
        </section>

        {errorMsg && (
          <div className="bg-retro-red border-2 border-retro-dark rounded-none p-4 text-center text-sm text-retro-cream font-bold font-mono shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] mb-6">
            {errorMsg}
          </div>
        )}

        {!errorMsg && (
          <section className="bg-white border-3 border-retro-dark rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-retro-yellow border-b-3 border-retro-dark text-retro-dark text-[10px] font-mono font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12">Pos</th>
                    <th className="py-3 px-4">Selección Nacional</th>
                    <th className="py-3 px-4 text-center">Participaciones</th>
                    <th className="py-3 px-4 text-right pr-6">Mundiales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-retro-dark text-sm">
                  {countriesRanking.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-gray-600 font-mono font-bold">
                        {query ? `No se encontró ninguna selección llamada "${query}".` : 'No hay registros disponibles.'}
                      </td>
                    </tr>
                  ) : (
                    countriesRanking.map((country, index) => {
                      // El Top 3 se calcula solo si no hay filtro activo para mantener la coherencia del medallero
                      const isTopThree = !query && index < 3 && country.tournamentTitles > 0;
                      
                      return (
                        <tr 
                          key={country.id} 
                          className={`${isTopThree ? 'bg-retro-yellow/20' : 'bg-white'} hover:bg-retro-cream transition-colors`}
                        >
                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            <span className={
                              !query && index === 0 && country.tournamentTitles > 0 ? 'text-retro-red' :
                              !query && index === 1 && country.tournamentTitles > 0 ? 'text-retro-green' :
                              !query && index === 2 && country.tournamentTitles > 0 ? 'text-retro-dark' : 'text-gray-400'
                            }>
                              #{query ? '-' : index + 1}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-retro-dark">
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{country.name}</span>
                              {!query && index === 0 && country.tournamentTitles > 0 && (
                                <span className="text-[9px] bg-retro-red text-retro-cream border-2 border-retro-dark px-2 py-0.5 rounded-none font-mono uppercase font-extrabold tracking-tighter">
                                  👑 REY
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Nueva Columna: Torneos Jugados */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-500">
                            {country.tournamentsPlayed}
                          </td>

                          <td className="py-3.5 px-4 text-right pr-6 font-mono font-bold">
                            <span className={country.tournamentTitles === 0 ? 'text-gray-400' : 'text-retro-green font-black text-lg'}>
                              {country.tournamentTitles}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}