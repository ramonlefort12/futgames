/**
 * Modelo estricto para las estadísticas de una Selección Nacional.
 */
export interface CountryStat {
  id: string;
  name: string;
  tournamentsPlayed: number;
  tournamentTitles: number;
}

/**
 * Modelo estricto para una Posición de juego en el campo.
 */
export interface Position {
  id: string; // Código único de la posición (ej: 'DC', 'MC', 'PT')
  name: string; // Nombre completo de la posición (ej: 'Delantero Centro', 'Mediocampista Central', 'Portero')
}

/**
 * Modelo estricto para una Selección Nacional (País).
 */
export interface Country {
  id: string;          // Código ISO o slug único (ej: 'arg', 'bra', 'esp')
  name: string;        // Nombre de la selección (ej: 'Argentina')
  flagUrl: string;     // Ruta local al SVG de la bandera en /public
  titlesCount: number; // Copas del Mundo ganadas (para la persistencia global)
  tournamentsPlayed: number; // Torneos jugados por los usuarios
  tournamentTitles: number; // Títulos de torneos ganados por los usuarios
}

/**
 * Modelo estricto para la entidad de un Jugador.
 */
export interface Player {
  id: string; // ID único del futbolista (ej: 'messi-2026')
  name: string; // Nombre completo (ej: 'Leo Messi')
  shortName: string; // Nombre común o de camiseta (ej: "I. Casillas", "Pelé")
  nickname: string; // Apodo histórico (ej: "El Santo", "O Rei")
  countryId: string; // Relación directa con el ID de la Selección (Country)
  position: string; // Posición principal del torneo referenciado
  otherPositions: string[]; // Posiciones secundarias mapeadas
  rating: number; // Puntuación general (0 - 99)
  worldCupEdition: number; // Año del Mundial específico que justifica el pico de rendimiento y rating
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

export interface LineupState {
  [key: string]: GridPositionState; 
}

/**
 * Estado global de una sesión/partida del Torneo de Footgames.
 * Ideal para manejar el estado centralizado (React Context / useReducer).
 */
export interface TournamentGameState {
  id: string;
  currentStep: 'START' | 'DRAFT' | 'SIMULATION' | 'RESULTS';
  userSelectionId: string | null;
  lineup: Record<string, GridPositionState>; 
  tournamentBracket: {
    quarters: MatchSimulation[];
    semis: MatchSimulation[];
    final: MatchSimulation[];
  } | null;
  
  hasWon: boolean | null;
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

export interface TournamentUpdatePayload {
  countryName: string;
}

export interface RivalTeam {
  name: string;
  baseRating: number;
}