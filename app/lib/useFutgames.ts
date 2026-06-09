// app/lib/useFutgames.ts
import { useState, useEffect } from 'react';
import { Position, GridPositionState, Player, Country, MatchSimulation } from '@/app/lib/definitions';
import { getPlayersByCountryAndPosition } from '@/app/lib/placeholder-data';
import { generateRandomCountriesForDraft } from '@/app/lib/utils';

export const FORMATIONS = {
  '4-3-3': {
    name: '4-3-3 Clásica',
    lines: [['EI', 'DC', 'ED'] as Position[], ['MC', 'MCO', 'MC2'] as Position[], ['LI', 'DFC', 'DFC2', 'LD'] as Position[], ['POR'] as Position[]]
  },
  '4-4-2': {
    name: '4-4-2 Tradicional',
    lines: [['DC', 'DC2'] as Position[], ['EI', 'MC', 'MC2', 'ED'] as Position[], ['LI', 'DFC', 'DFC2', 'LD'] as Position[], ['POR'] as Position[]]
  },
  '3-5-2': {
    name: '3-5-2 Continental',
    lines: [['DC', 'DC2'] as Position[], ['EI', 'MC', 'MCD', 'MC2', 'ED'] as Position[], ['LI', 'DFC', 'LD'] as Position[], ['POR'] as Position[]]
  }
};

export type FormationType = keyof typeof FORMATIONS;
export type TournamentStage = 'GRUPO J1' | 'GRUPO J2' | 'GRUPO J3' | 'OCTAVOS' | 'CUARTOS' | 'SEMIS' | 'FINAL';

export interface GroupTeamState { name: string; rating: number; points: number; gf: number; gc: number; }
export interface PlayoffBracket {
  octavos: { id: string; t1: string; t2: string; w?: string }[];
  cuartos: { id: string; t1: string; t2: string; w?: string }[];
  semis: { id: string; t1: string; t2: string; w?: string }[];
  final: { id: string; t1: string; t2: string; w?: string };
}

const WORLD_TEAMS_POOL = [
  { name: 'Argentina', baseRating: 90 }, { name: 'Francia', baseRating: 89 },
  { name: 'Brasil', baseRating: 88 }, { name: 'Inglaterra', baseRating: 88 },
  { name: 'España', baseRating: 87 }, { name: 'Portugal', baseRating: 86 },
  { name: 'Alemania', baseRating: 85 }, { name: 'Países Bajos', baseRating: 85 },
  { name: 'Italia', baseRating: 84 }, { name: 'Marruecos', baseRating: 83 },
  { name: 'Croacia', baseRating: 83 }, { name: 'Uruguay', baseRating: 82 },
  { name: 'Japón', baseRating: 81 }, { name: 'Colombia', baseRating: 81 },
  { name: 'Estados Unidos', baseRating: 80 }, { name: 'México', baseRating: 79 },
  { name: 'Senegal', baseRating: 79 }, { name: 'Bélgica', baseRating: 82 }
];

export function useFutgames() {
  const [currentFormation, setCurrentFormation] = useState<FormationType>('4-3-3');
  const [lineup, setLineup] = useState<Record<string, GridPositionState>>({});
  const [view, setView] = useState<'PLAY' | 'TOURNAMENT_BRACKET'>('PLAY');
  const [userRating, setUserRating] = useState<number>(0);
  const [matchesLog, setMatchesLog] = useState<MatchSimulation[]>([]);
  const [tournamentStage, setTournamentStage] = useState<TournamentStage>('GRUPO J1');
  const [tournamentStatus, setTournamentStatus] = useState<'PLAYING' | 'CHAMPION' | 'ELIMINATED'>('PLAYING');
  const [groupTeams, setGroupTeams] = useState<GroupTeamState[]>([]);
  const [bracket, setBracket] = useState<PlayoffBracket | null>(null);

  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [currentCountryOptions, setCurrentCountryOptions] = useState<Country | null>(null);
  const [draftCandidates, setDraftCandidates] = useState<Player[]>([]);

  const userTeamNameLabel = lineup[Object.keys(lineup)[0]]?.assignedCountry?.name || 'Tu Equipo';

  // Efecto 1: Cambios de formación
  useEffect(() => {
    const selectedFormation = FORMATIONS[currentFormation];
    const newState = {} as Record<string, GridPositionState>;
    selectedFormation.lines.flat().forEach((pos) => {
      newState[pos] = { position: pos.replace(/\d/g, '') as Position, assignedCountry: null, selectedPlayer: null, isLocked: false };
    });
    setLineup(newState);
    setView('PLAY');
  }, [currentFormation]);

  // Efecto 2: OVR Team
  useEffect(() => {
    const selectedPlayers = Object.values(lineup).filter((slot) => slot.selectedPlayer);
    if (selectedPlayers.length === 0) { setUserRating(0); return; }
    const totalRating = selectedPlayers.reduce((sum, slot) => sum + (slot.selectedPlayer?.rating || 0), 0);
    setUserRating(Math.round(totalRating / selectedPlayers.length));
  }, [lineup]);

  // Efecto 3: Sincronizar OVR del usuario en la tabla de grupos
  useEffect(() => {
    setGroupTeams(prev => prev.map(t => t.name === userTeamNameLabel ? { ...t, rating: userRating } : t));
  }, [userRating, userTeamNameLabel]);

  const initTournamentStructure = () => {
    const shuffled = [...WORLD_TEAMS_POOL].sort(() => Math.random() - 0.5);
    const selectedRivals = shuffled.slice(0, 3);
    const initialGroup: GroupTeamState[] = [
      { name: userTeamNameLabel, rating: userRating, points: 0, gf: 0, gc: 0 },
      ...selectedRivals.map(r => ({ name: r.name, rating: r.baseRating, points: 0, gf: 0, gc: 0 }))
    ];
    setGroupTeams(initialGroup);
    setBracket(null);
    setTournamentStage('GRUPO J1');
    setTournamentStatus('PLAYING');
    setMatchesLog([]);
    setView('TOURNAMENT_BRACKET');
  };

  const generateGlobalBracket = (userTeam: string) => {
    const shuffledPool = [...WORLD_TEAMS_POOL]
      .filter(t => t.name !== userTeam && !groupTeams.some(g => g.name === t.name))
      .sort(() => Math.random() - 0.5);
    const secondPlaceGroup = groupTeams[1]?.name || 'Rival IA';

    setBracket({
      octavos: [
        { id: 'o1', t1: userTeam, t2: shuffledPool[0].name },
        { id: 'o2', t1: shuffledPool[1].name, t2: shuffledPool[2].name },
        { id: 'o3', t1: shuffledPool[3].name, t2: shuffledPool[4].name },
        { id: 'o4', t1: shuffledPool[5].name, t2: secondPlaceGroup },
      ],
      cuartos: [
        { id: 'c1', t1: 'Ganador Octavos 1', t2: 'Ganador Octavos 2' },
        { id: 'c2', t1: 'Ganador Octavos 3', t2: 'Ganador Octavos 4' }
      ],
      semis: [{ id: 's1', t1: 'Ganador Cuartos 1', t2: 'Ganador Cuartos 2' }],
      final: { id: 'f1', t1: 'Ganador Semis', t2: shuffledPool[6].name }
    });
  };

  const handleSlotClick = (slotKey: string, position: Position) => {
    if (lineup[slotKey]?.isLocked) return;
    const randomCountries = generateRandomCountriesForDraft();
    if (randomCountries.length === 0) return;
    const selectedCountry = randomCountries[0];
    const candidates = getPlayersByCountryAndPosition(selectedCountry.id, position);
    setActiveSlot(slotKey);
    setCurrentCountryOptions(selectedCountry);
    setDraftCandidates(candidates);
  };

  const handleSelectPlayer = (player: Player) => {
    if (!activeSlot || !currentCountryOptions) return;
    setLineup((prev) => ({ ...prev, [activeSlot]: { ...prev[activeSlot], assignedCountry: currentCountryOptions, selectedPlayer: player, isLocked: true } }));
    setActiveSlot(null); setCurrentCountryOptions(null); setDraftCandidates([]);
  };

  const simulateMatch = (userPower: number, rivalPower: number, userTeamName: string, rivalTeamName: string, allowDraw = true): MatchSimulation => {
    const hasMaguire = Object.values(lineup).some(slot => slot.selectedPlayer?.id === 'p-maguire');
    const effectiveUserPower = hasMaguire ? Math.max(50, userPower - 12) : userPower;
    const powerDifferential = effectiveUserPower - rivalPower;
    
    let userGoals = Math.max(0, 1 + Math.floor(Math.random() * 3) - 1 + (powerDifferential > 5 ? 1 : 0) + (powerDifferential > 12 ? 1 : 0));
    let rivalGoals = Math.max(0, 1 + Math.floor(Math.random() * 3) - 1 + (powerDifferential < -5 ? 1 : 0) + (powerDifferential < -12 ? 1 : 0));

    if (!allowDraw && userGoals === rivalGoals) {
      if (Math.random() > 0.5) userGoals += 1; else rivalGoals += 1;
    }
    return {
      id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      homeTeamName: userTeamName, awayTeamName: rivalTeamName, homeScore: userGoals, awayScore: rivalGoals, isCompleted: true,
      winnerName: userGoals > rivalGoals ? userTeamName : (userGoals < rivalGoals ? rivalTeamName : 'EMPATE')
    };
  };

  const handleNextRonda = () => {
    if (tournamentStage.startsWith('GRUPO J')) {
      let rivalName = '';
      if (tournamentStage === 'GRUPO J1') rivalName = groupTeams[1]?.name;
      if (tournamentStage === 'GRUPO J2') rivalName = groupTeams[2]?.name;
      if (tournamentStage === 'GRUPO J3') rivalName = groupTeams[3]?.name;

      const rivalObj = groupTeams.find(t => t.name === rivalName);
      const userMatch = simulateMatch(userRating, rivalObj?.rating || 80, userTeamNameLabel, rivalName, true);
      
      const iaTeams = groupTeams.filter(t => t.name !== userTeamNameLabel && t.name !== rivalName);
      const iaMatch = simulateMatch(iaTeams[0]?.rating || 80, iaTeams[1]?.rating || 80, iaTeams[0]?.name, iaTeams[1]?.name, true);

      setMatchesLog(prev => [...prev, userMatch, iaMatch]);

      // Helper inline para mutar la tabla localmente de forma segura
      setGroupTeams(prev => {
        const updated = prev.map(team => {
          let p = team.points, gf = team.gf, gc = team.gc;
          [userMatch, iaMatch].forEach(m => {
            if (team.name === m.homeTeamName) { gf += m.homeScore; gc += m.awayScore; p += m.winnerName === m.homeTeamName ? 3 : (m.winnerName === 'EMPATE' ? 1 : 0); }
            else if (team.name === m.awayTeamName) { gf += m.awayScore; gc += m.homeScore; p += m.winnerName === m.awayTeamName ? 3 : (m.winnerName === 'EMPATE' ? 1 : 0); }
          });
          return { ...team, points: p, gf, gc };
        });
        return updated.sort((a, b) => b.points - a.points || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);
      });

      if (tournamentStage === 'GRUPO J1') setTournamentStage('GRUPO J2');
      else if (tournamentStage === 'GRUPO J2') setTournamentStage('GRUPO J3');
      else if (tournamentStage === 'GRUPO J3') {
        setGroupTeams(currentSorted => {
          if (currentSorted.findIndex(t => t.name === userTeamNameLabel) <= 1) {
            setTournamentStage('OCTAVOS'); generateGlobalBracket(userTeamNameLabel);
          } else { setTournamentStatus('ELIMINATED'); }
          return currentSorted;
        });
      }
      return;
    }

    if (!bracket) return;

    if (tournamentStage === 'OCTAVOS') {
      const userMatch = simulateMatch(userRating, WORLD_TEAMS_POOL.find(t => t.name === bracket.octavos[0].t2)?.baseRating || 83, userTeamNameLabel, bracket.octavos[0].t2, false);
      const w2 = Math.random() > 0.5 ? bracket.octavos[1].t1 : bracket.octavos[1].t2;
      const w3 = Math.random() > 0.5 ? bracket.octavos[2].t1 : bracket.octavos[2].t2;
      const w4 = Math.random() > 0.5 ? bracket.octavos[3].t1 : bracket.octavos[3].t2;
      setMatchesLog(prev => [...prev, userMatch]);

      if (userMatch.winnerName === userTeamNameLabel) {
        setBracket(prev => !prev ? null : {
          ...prev,
          octavos: prev.octavos.map((o, i) => ({ ...o, w: [userTeamNameLabel, w2, w3, w4][i] })),
          cuartos: [{ id: 'c1', t1: userTeamNameLabel, t2: w2 }, { id: 'c2', t1: w3, t2: w4 }]
        });
        setTournamentStage('CUARTOS');
      } else { setTournamentStatus('ELIMINATED'); }
    }
    else if (tournamentStage === 'CUARTOS') {
      const userMatch = simulateMatch(userRating, WORLD_TEAMS_POOL.find(t => t.name === bracket.cuartos[0].t2)?.baseRating || 84, userTeamNameLabel, bracket.cuartos[0].t2, false);
      const w2 = Math.random() > 0.5 ? bracket.cuartos[1].t1 : bracket.cuartos[1].t2;
      setMatchesLog(prev => [...prev, userMatch]);

      if (userMatch.winnerName === userTeamNameLabel) {
        setBracket(prev => !prev ? null : {
          ...prev,
          cuartos: prev.cuartos.map((c, i) => ({ ...c, w: [userTeamNameLabel, w2][i] })),
          semis: [{ id: 's1', t1: userTeamNameLabel, t2: w2 }]
        });
        setTournamentStage('SEMIS');
      } else { setTournamentStatus('ELIMINATED'); }
    }
    else if (tournamentStage === 'SEMIS') {
      const userMatch = simulateMatch(userRating, WORLD_TEAMS_POOL.find(t => t.name === bracket.semis[0].t2)?.baseRating || 86, userTeamNameLabel, bracket.semis[0].t2, false);
      setMatchesLog(prev => [...prev, userMatch]);

      if (userMatch.winnerName === userTeamNameLabel) {
        setBracket(prev => !prev ? null : { ...prev, semis: [{ ...prev.semis[0], w: userTeamNameLabel }], final: { ...prev.final, t1: userTeamNameLabel } });
        setTournamentStage('FINAL');
      } else { setTournamentStatus('ELIMINATED'); }
    }
    else if (tournamentStage === 'FINAL') {
      const userMatch = simulateMatch(userRating, WORLD_TEAMS_POOL.find(t => t.name === bracket.final.t2)?.baseRating || 88, userTeamNameLabel, bracket.final.t2, false);
      setMatchesLog(prev => [...prev, userMatch]);
      if (userMatch.winnerName === userTeamNameLabel) {
        setBracket(prev => !prev ? null : { ...prev, final: { ...prev.final, w: userTeamNameLabel } });
        setTournamentStatus('CHAMPION');
      } else { setTournamentStatus('ELIMINATED'); }
    }
  };

  const totalSelected = Object.values(lineup).filter((slot) => slot.selectedPlayer).length;
  const totalPositionsInFormation = Object.values(lineup).length;

  return {
    currentFormation, setCurrentFormation, lineup, setLineup, view, setView, userRating, matchesLog, setMatchesLog,
    tournamentStage, setTournamentStage, tournamentStatus, setTournamentStatus, groupTeams, bracket, activeSlot, setActiveSlot,
    currentCountryOptions, setCurrentCountryOptions, draftCandidates, setDraftCandidates, userTeamNameLabel, totalSelected,
    totalPositionsInFormation, initTournamentStructure, handleSlotClick, handleSelectPlayer, handleNextRonda
  };
}