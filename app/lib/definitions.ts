/**
 * Posiciones tácticas válidas en el terreno de juego.
 * Restringido por tipado para evitar strings arbitrarios.
 */
export type Position = 'POR' | 'LI' | 'DFC' | 'LD' | 'MCO' | 'MC' | 'MCD' | 'EI' | 'ED' | 'DC';

/**
 * Rarezas/Categorías disponibles para los cromos de los jugadores.
 * Determina el diseño visual CSS y los modificadores de probabilidad.
 */
export type PlayerRarity = 'COMMON' | 'SILVER' | 'GOLD' | 'LEGEND' | 'MEME';

/**
 * Modelo estricto para una Selección Nacional (País).
 */
export interface Country {
  id: string;          // Código ISO o slug único (ej: 'arg', 'bra', 'esp')
  name: string;        // Nombre de la selección (ej: 'Argentina')
  flagUrl: string;     // Ruta local al SVG de la bandera en /public
  titlesCount: number; // Copas del Mundo ganadas (para la persistencia global)
}

/**
 * Modelo estricto para la entidad de un Jugador.
 */
export interface Player {
  id: string;          // ID único del futbolista (ej: 'messi-2026')
  name: string;        // Nombre comercial (ej: 'L. Messi')
  countryId: string;   // Relación directa con el ID de la Selección (Country)
  position: Position;  // Posición natural del jugador
  rating: number;      // Puntuación general (0 - 99)
  rarity: PlayerRarity;// Tipo de cromo para renderizado UI
  imageUrl?: string;   // Opcional: Silueta vectorial o foto comprimida
}

/**
 * Estado dinámico de una posición individual dentro del Once Titular del usuario.
 */
export interface GridPositionState {
  position: Position;   // Posición del campo (ej: 'DC')
  assignedCountry: Country | null; // País sorteado aleatoriamente para este slot
  selectedPlayer: Player | null;   // Jugador elegido por el usuario de ese país
  isLocked: boolean;    // Bloqueado una vez que el usuario confirma su elección
}

/**
 * Estado global de una sesión/partida del Torneo de Futgames.
 * Ideal para manejar el estado centralizado (React Context / useReducer).
 */
export interface TournamentGameState {
  id: string;               // ID único de la sesión de juego
  currentStep: 'START' | 'DRAFT' | 'SIMULATION' | 'RESULTS';
  userSelectionId: string | null; // Selección que el usuario eligió defender al inicio
  lineup: Record<Position, GridPositionState>; // Tu 11 ideal estructurado
  tournamentBracket: {
    quarters: MatchSimulation[];
    semis: MatchSimulation[];
    final: MatchSimulation[];
  } | null;
  hasWon: boolean | null;   // Resultado de la final
}

/**
 * Estructura de datos para la resolución matemática de un partido.
 */
export interface MatchSimulation {
  id: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  isCompleted: boolean;
  winnerName: string;
}

/**
 * Modelo para el minijuego diario "Immaculate Grid" (Cuadrícula 3x3).
 */
export interface DailyGridChallenge {
  date: string; // Formato YYYY-MM-DD para control diario
  rows: { type: 'COUNTRY' | 'CLUB'; value: string }[]; // Criterios de filas (ej: España, Real Madrid)
  cols: { type: 'COUNTRY' | 'CLUB' | 'STAT'; value: string }[]; // Criterios de columnas (ej: Brasil, +100 goles)
  matrixAnswers: Record<string, string[]>; // IDs de respuestas válidas por cada celda [row_index, col_index]
}