// app/stats/page.tsx
import { sql } from '@vercel/postgres';
import Link from 'next/link';

// Forzamos a Next.js a no cachear estáticamente esta página de forma indefinida, 
// revalidando los datos de los títulos en tiempo real en cada carga.
export const revalidate = 0;

interface DatabaseCountryRow {
  id: string;
  name: string;
  titles: number;
}

/**
 * Server Component que consulta el palmarés global y renderiza 
 * el HTML optimizado directamente desde el servidor.
 */
export default async function StatsPage() {
  let countriesRanking: DatabaseCountryRow[] = [];
  let errorMsg = '';

  try {
    // Consulta SQL estructurada para traer los países ordenados por títulos descendentemente
    const { rows } = await sql<DatabaseCountryRow>`
      SELECT id, name, titles 
      FROM countries 
      ORDER BY titles DESC, name ASC;
    `;
    countriesRanking = rows;
  } catch (err: any) {
    console.error('Error del servidor leyendo el ranking:', err);
    errorMsg = 'No se pudo conectar con el servidor de clasificaciones.';
  }

  // Calculamos la suma total de mundiales jugados en la plataforma para métricas analíticas
  const totalGlobalTitles = countriesRanking.reduce((sum, country) => sum + Number(country.titles), 0);

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark p-4 md:p-8 flex flex-col items-center">
      
      {/* CONTENEDOR DE ANCHO MÁXIMO (MOBILE-FIRST) */}
      <div className="w-full max-w-md flex flex-col">
        
        {/* ENLACE DE RETORNO AL JUEGO */}
        <Link 
          href="/" 
          className="text-xs font-mono text-retro-green hover:underline mb-6 flex items-center gap-1 self-start font-bold"
        >
          ← volver al campo de juego
        </Link>

        {/* CABECERA DE LA PÁGINA */}
        <header className="mb-6">
          <h1 className="retro-heading font-black text-3xl tracking-tighter text-retro-dark uppercase">
            Palmarés <span className="text-retro-green">Mundial</span>
          </h1>
          <p className="text-xs text-gray-600 mt-2 font-mono font-bold">
            Historial colectivo en tiempo real de torneos conquistados por comunidad.
          </p>
        </header>

        {/* PANEL DE ESTADÍSTICAS GENERALES */}
        <section className="bg-white border-2 border-retro-dark rounded-none p-4 mb-6 flex justify-between items-center text-xs font-mono font-bold shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
          <div>
            <span className="text-gray-600 block uppercase text-[9px] tracking-wider">Total Torneos</span>
            <span className="text-retro-dark font-black text-base">{totalGlobalTitles}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600 block uppercase text-[9px] tracking-wider">Líder Actual</span>
            <span className="text-retro-green font-black text-base">
              {countriesRanking[0]?.titles > 0 ? countriesRanking[0].name : 'Ninguno'}
            </span>
          </div>
        </section>

        {/* TRATAMIENTO DE EXCEPCIONES EN UI */}
        {errorMsg && (
          <div className="bg-retro-red border-2 border-retro-dark rounded-none p-4 text-center text-sm text-retro-cream font-bold font-mono">
            {errorMsg}
          </div>
        )}

        {/* TABLA COMPACTA DEL RANKING PREMIUM */}
        {!errorMsg && (
          <section className="bg-white border-3 border-retro-dark rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-retro-yellow border-b-3 border-retro-dark text-retro-dark text-[10px] font-mono font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-12">Pos</th>
                  <th className="py-3 px-4">Selección Nacional</th>
                  <th className="py-3 px-4 text-right pr-6">Mundiales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-retro-dark text-sm">
                {countriesRanking.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-xs text-gray-600 font-mono font-bold">
                      No hay registros de victorias aún.
                    </td>
                  </tr>
                ) : (
                  countriesRanking.map((country, index) => {
                    const isTopThree = index < 3 && country.titles > 0;
                    
                    return (
                      <tr 
                        key={country.id} 
                        className={`${isTopThree ? 'bg-retro-yellow/20' : 'bg-white'} hover:bg-retro-cream transition-colors`}
                      >
                        {/* COLUMNA 1: POSICIÓN EN EL RANKING */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          <span className={
                            index === 0 && country.titles > 0 ? 'text-retro-red' :
                            index === 1 && country.titles > 0 ? 'text-retro-green' :
                            index === 2 && country.titles > 0 ? 'text-retro-dark' : 'text-gray-400'
                          }>
                            #{index + 1}
                          </span>
                        </td>

                        {/* COLUMNA 2: NOMBRE DEL PAÍS */}
                        <td className="py-3.5 px-4 font-bold text-retro-dark">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{country.name}</span>
                            {index === 0 && country.titles > 0 && (
                              <span className="text-[9px] bg-retro-red text-retro-cream border-2 border-retro-dark px-2 py-0.5 rounded-none font-mono uppercase font-extrabold tracking-tighter">
                                👑 REY
                              </span>
                            )}
                          </div>
                        </td>

                        {/* COLUMNA 3: TOTAL DE TÍTULOS */}
                        <td className="py-3.5 px-4 text-right pr-6 font-mono font-bold">
                          <span className={country.titles === 0 ? 'text-gray-400' : 'text-retro-green font-black text-lg'}>
                            {country.titles}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>
        )}

      </div>
    </div>
  );
}