import 'server-only';
import sql from './db';
import { Country, CountryStat, Player, Position, RivalTeam } from '@/lib/definitions';

/**
 * Obtiene el palmarés de países filtrado por nombre.
 */
export async function getCountryStats(query: string): Promise<CountryStat[]> {
  try {
    const stats = await sql<CountryStat[]>`
      SELECT 
        id, 
        name, 
        tournaments_played AS "tournamentsPlayed", 
        tournament_titles AS "tournamentTitles"
      FROM countries
      WHERE name ILIKE ${'%' + query + '%'}
      ORDER BY tournament_titles DESC, tournaments_played DESC, name ASC
    `;
    return stats;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch country stats from database.');
  }
}

/**
 * Obtiene todas las selecciones nacionales.
 */
export async function getCountries(): Promise<Record<string, Country>> {
  try {
    const countriesArray = await sql<Country[]>`
      SELECT id, name, flag_url AS "flagUrl", titles_count AS "titlesCount", 
             tournaments_played AS "tournamentsPlayed", tournament_titles AS "tournamentTitles"
      FROM countries
    `;
    
    const countriesRecord: Record<string, Country> = {};
    countriesArray.forEach((country: Country) => {
      countriesRecord[country.id] = country;
    });
    
    return countriesRecord;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw new Error('Failed to fetch countries data.');
  }
}

/**
 * Filtra jugadores por país y posición.
 */
export async function getPlayersByCountryAndPosition(
  countryId: string, 
  position: Position | string
): Promise<Player[]> {
  try {
    // Forzamos las variables a string para que el tagged template no sufra al tipar
    const cId = countryId as string;
    const pos = position as string;

    const players = await (sql`
      SELECT 
        p.id, 
        p.name, 
        p.short_name AS "shortName", 
        p.nickname, 
        p.country_id AS "countryId", 
        p.primary_position AS "position", 
        ARRAY(
          SELECT pp.position_code 
          FROM player_positions pp 
          WHERE pp.player_id = p.id
        ) AS "otherPositions", 
        p.rating, 
        p.world_cup_edition AS "worldCupEdition",
        p.image_url AS "imageUrl"
      FROM players p
      WHERE p.country_id = ${cId}
        AND (
          p.primary_position = ${pos} 
          OR EXISTS (
            SELECT 1 FROM player_positions pp 
            WHERE pp.player_id = p.id AND pp.position_code = ${pos}
          )
        )
      ORDER BY p.rating DESC
    ` as Promise<Player[]>);
    
    return players;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch players from database.');
  }
}

/**
 * Obtiene el catálogo completo de jugadores.
 */
export async function getAllPlayers(): Promise<Player[]> {
  try {
    const players = await (sql`
      SELECT 
        p.id, 
        p.name, 
        p.short_name AS "shortName", 
        p.nickname, 
        p.country_id AS "countryId", 
        p.primary_position AS "position", 
        ARRAY(
          SELECT pp.position_code
          FROM player_positions pp 
          WHERE pp.player_id = p.id
        ) AS "otherPositions", 
        p.rating, 
        p.world_cup_edition AS "worldCupEdition"
      FROM players p
      ORDER BY p.rating DESC
    ` as Promise<Player[]>);
    
    return players;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all players from database.');
  }
}

/**
 * Obtiene posiciones disponibles.
 */
export async function getPositions(): Promise<{ id: string; name: string }[]> {
  try {
    // Asegúrate de que las columnas coincidan con tu DB (he usado code e id)
    const positionsRaw = await sql`
      SELECT id, name FROM positions
    `;
    return positionsRaw as { id: string; name: string }[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch positions from database.');
  }
}

export async function recordTournamentPlayed(countryName: string): Promise<void> {
  try {
    await sql`
      UPDATE countries 
      SET tournaments_played = tournaments_played + 1 
      WHERE name = ${countryName}
    `;
  } catch (error) {
    console.error('Database Error - recordTournamentPlayed:', error);
    throw new Error('Failed to update tournaments_played.');
  }
}

export async function recordTournamentWin(countryName: string): Promise<void> {
  try {
    await sql`
      UPDATE countries 
      SET tournament_titles = tournament_titles + 1 
      WHERE name = ${countryName}
    `;
  } catch (error) {
    console.error('Database Error - recordTournamentWin:', error);
    throw new Error('Failed to update tournament_titles.');
  }
}

export async function getRivalTeams(): Promise<RivalTeam[]> {
  try {
    const rivals = await sql<RivalTeam[]>`
      SELECT name, base_rating AS "baseRating"
      FROM rival_teams
      ORDER BY base_rating DESC
    `;
    return rivals;
  } catch (error) {
    console.error('Database Error - getRivalTeams:', error);
    throw new Error('Failed to fetch rival teams from database.');
  }
}