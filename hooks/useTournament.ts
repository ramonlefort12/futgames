// hooks/useTournament.ts
'use client';

import { useState, useEffect } from 'react';
import { Position, GridPositionState, Player, Country, MatchSimulation, TournamentUpdatePayload, RivalTeam } from '@/lib/definitions';
import { generateRandomCountriesForDraft } from '@/app/lib/utils';

export const FORMATIONS = {
  '4-3-3': { 
    name: '4-3-3 Clásica', 
    lines: [['EI', 'DC', 'ED'], ['MC', 'MC2', 'MC3'], ['LI', 'DFC', 'DFC2', 'LD'], ['POR']] 
  },
  '4-3-3 - Of': { 
    name: '4-3-3 Ofensiva', 
    lines: [['EI', 'DC', 'ED'], ['MC', 'MCO', 'MC2'], ['LI', 'DFC', 'DFC2', 'LD'], ['POR']] 
  },
  '4-3-3 - Def': { 
    name: '4-3-3 Defensiva', 
    lines: [['EI', 'DC', 'ED'], ['MC', 'MCD', 'MC2'], ['LI', 'DFC', 'DFC2', 'LD'], ['POR']] 
  },
  '4-4-2': { 
    name: '4-4-2 Tradicional', 
    lines: [['DC', 'DC2'], ['EI', 'MC', 'MC2', 'ED'], ['LI', 'DFC', 'DFC2', 'LD'], ['POR']] 
  },
  '3-5-2': { 
    name: '3-5-2 Continental', 
    lines: [['DC', 'DC2'], ['EI', 'MC', 'MCD', 'MC2', 'ED'], ['LI', 'DFC', 'LD'], ['POR']] 
  }
};
export type FormationType = keyof typeof FORMATIONS;
export type TournamentStage = 'GRUPO J1' | 'GRUPO J2' | 'GRUPO J3' | 'OCTAVOS' | 'CUARTOS' | 'SEMIS' | 'FINAL';
export interface GroupTeamState { name: string; rating: number; points: number; gf: number; gc: number; }
export interface MatchSlot { id: string; t1: string; t2: string; score1?: number; score2?: number; w?: string; }
export interface PlayoffBracket { octavos: MatchSlot[]; cuartos: MatchSlot[]; semis: MatchSlot[]; final: MatchSlot; }

export function useTournaments(
  initialCountries: Country[], 
  initialPlayers: Player[], 
  initialRivals: RivalTeam[]
) {
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
  const [userTeamNameLabel, setUserTeamNameLabel] = useState<string>('Estados Unidos');

  useEffect(() => {
    const selectedFormation = FORMATIONS[currentFormation];
    const newState = {} as Record<string, GridPositionState>;
    selectedFormation.lines.flat().forEach((pos) => {
      newState[pos] = { 
        position: pos.replace(/\d/g, '') as unknown as Position, 
        assignedCountry: null, 
        selectedPlayer: null, 
        isLocked: false 
      };
    });
    setLineup(newState);
    setView('PLAY');
  }, [currentFormation]);

  useEffect(() => {
    const selectedPlayers = Object.values(lineup).filter((slot) => slot.selectedPlayer);
    if (selectedPlayers.length === 0) { setUserRating(0); return; }
    const totalRating = selectedPlayers.reduce((sum, slot) => sum + (slot.selectedPlayer?.rating || 0), 0);
    setUserRating(Math.round(totalRating / selectedPlayers.length));
  }, [lineup]);

  useEffect(() => {
    setGroupTeams(prev => prev.map(t => t.name === userTeamNameLabel ? { ...t, rating: userRating } : t));
  }, [userRating, userTeamNameLabel]);

  const logTournamentStat = (type: 'play' | 'win', teamName: string) => {
    const payload: TournamentUpdatePayload = { countryName: teamName };
    fetch(`/api/tournaments/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error(`Error logging tournament ${type}:`, err));
  };

  const initTournamentStructure = () => {
    const shuffled = [...initialRivals]
      .filter(t => !t.name.toLowerCase().includes(userTeamNameLabel.toLowerCase()))
      .sort(() => Math.random() - 0.5);
      
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
    
    logTournamentStat('play', userTeamNameLabel);
  };

  const getTeamRating = (teamName: string): number => {
    if (teamName === userTeamNameLabel) return userRating;
    return initialRivals.find(t => t.name === teamName)?.baseRating || 82;
  };

  const generateGlobalBracket = (userTeam: string) => {
    const pool = [...initialRivals]
      .filter(t => !t.name.toLowerCase().includes(userTeam.toLowerCase()) && !groupTeams.some(g => g.name === t.name))
      .sort(() => Math.random() - 0.5);

    const secondPlaceGroup = groupTeams[1]?.name || 'Rival IA';

    setBracket({
      octavos: [
        { id: 'o1', t1: userTeam, t2: pool[0].name },
        { id: 'o2', t1: pool[1].name, t2: pool[2].name },
        { id: 'o3', t1: pool[3].name, t2: pool[4].name },
        { id: 'o4', t1: pool[5].name, t2: secondPlaceGroup },
        { id: 'o5', t1: pool[6].name, t2: pool[7].name },
        { id: 'o6', t1: pool[8].name, t2: pool[9].name },
        { id: 'o7', t1: pool[10].name, t2: pool[11].name },
        { id: 'o8', t1: pool[12].name, t2: pool[13].name },
      ],
      cuartos: [
        { id: 'c1', t1: 'Ganador o1', t2: 'Ganador o2' },
        { id: 'c2', t1: 'Ganador o3', t2: 'Ganador o4' },
        { id: 'c3', t1: 'Ganador o5', t2: 'Ganador o6' },
        { id: 'c4', t1: 'Ganador o7', t2: 'Ganador o8' },
      ],
      semis: [
        { id: 's1', t1: 'Ganador c1', t2: 'Ganador c2' },
        { id: 's2', t1: 'Ganador c3', t2: 'Ganador c4' }
      ],
      final: { id: 'f1', t1: 'Ganador s1', t2: 'Ganador s2' }
    });
  };

  const handleSlotClick = (slotKey: string, position: Position) => {
    if (lineup[slotKey]?.isLocked) return;
    
    const randomCountries = generateRandomCountriesForDraft(initialCountries);
    if (randomCountries.length === 0) return;
    const selectedCountry = randomCountries[0];
    
    const rawCandidates = initialPlayers.filter((player) => {
      if (player.countryId !== selectedCountry.id) return false;
      const playerPos = String(player.position);
      const targetPos = String(position);
      return playerPos === targetPos || player.otherPositions.map(String).includes(targetPos);
    });
    
    const playersInLineupIds = Object.values(lineup).map(slot => slot.selectedPlayer?.id).filter(Boolean);
    const availableCandidates = rawCandidates.filter(player => !playersInLineupIds.includes(player.id));
    const randomFilteredCandidates = [...availableCandidates].sort(() => Math.random() - 0.5).slice(0, 3);

    setActiveSlot(slotKey);
    setCurrentCountryOptions(selectedCountry);
    setDraftCandidates(randomFilteredCandidates);
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

      setGroupTeams(prev => {
        const updated = prev.map(team => {
          let p = team.points, gf = team.gf, gc = team.gc;
          if (team.name === userMatch.homeTeamName) { gf += userMatch.homeScore; gc += userMatch.awayScore; p += userMatch.winnerName === userMatch.homeTeamName ? 3 : (userMatch.winnerName === 'EMPATE' ? 1 : 0); }
          else if (team.name === userMatch.awayTeamName) { gf += userMatch.awayScore; gc += userMatch.homeScore; p += userMatch.winnerName === userMatch.awayTeamName ? 3 : (userMatch.winnerName === 'EMPATE' ? 1 : 0); }
          
          if (team.name === iaMatch.homeTeamName) { gf += iaMatch.homeScore; gc += iaMatch.awayScore; p += iaMatch.winnerName === iaMatch.homeTeamName ? 3 : (iaMatch.winnerName === 'EMPATE' ? 1 : 0); }
          else if (team.name === iaMatch.awayTeamName) { gf += iaMatch.awayScore; gc += iaMatch.homeScore; p += iaMatch.winnerName === iaMatch.awayTeamName ? 3 : (iaMatch.winnerName === 'EMPATE' ? 1 : 0); }
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
      const simulatedOctavos = bracket.octavos.map(match => {
        const p1 = getTeamRating(match.t1);
        const p2 = getTeamRating(match.t2);
        const sim = simulateMatch(p1, p2, match.t1, match.t2, false);
        return { ...match, score1: sim.homeScore, score2: sim.awayScore, w: sim.winnerName };
      });

      const userMatch = simulatedOctavos[0];
      setMatchesLog(prev => [...prev, { id: userMatch.id, homeTeamName: userMatch.t1, awayTeamName: userMatch.t2, homeScore: userMatch.score1!, awayScore: userMatch.score2!, isCompleted: true, winnerName: userMatch.w! }]);

      if (userMatch.w === userTeamNameLabel) {
        setBracket(prev => {
          if (!prev) return null;
          const nextCuartos = [
            { id: 'c1', t1: simulatedOctavos[0].w!, t2: simulatedOctavos[1].w! },
            { id: 'c2', t1: simulatedOctavos[2].w!, t2: simulatedOctavos[3].w! },
            { id: 'c3', t1: simulatedOctavos[4].w!, t2: simulatedOctavos[5].w! },
            { id: 'c4', t1: simulatedOctavos[6].w!, t2: simulatedOctavos[7].w! }
          ];
          return { ...prev, octavos: simulatedOctavos, cuartos: nextCuartos };
        });
        setTournamentStage('CUARTOS');
      } else {
        setBracket(prev => prev ? { ...prev, octavos: simulatedOctavos } : null);
        setTournamentStatus('ELIMINATED');
      }
    } 
    else if (tournamentStage === 'CUARTOS') {
      const simulatedCuartos = bracket.cuartos.map(match => {
        const p1 = getTeamRating(match.t1);
        const p2 = getTeamRating(match.t2);
        const sim = simulateMatch(p1, p2, match.t1, match.t2, false);
        return { ...match, score1: sim.homeScore, score2: sim.awayScore, w: sim.winnerName };
      });

      const userMatch = simulatedCuartos[0];
      setMatchesLog(prev => [...prev, { id: userMatch.id, homeTeamName: userMatch.t1, awayTeamName: userMatch.t2, homeScore: userMatch.score1!, awayScore: userMatch.score2!, isCompleted: true, winnerName: userMatch.w! }]);

      if (userMatch.w === userTeamNameLabel) {
        setBracket(prev => {
          if (!prev) return null;
          const nextSemis = [
            { id: 's1', t1: simulatedCuartos[0].w!, t2: simulatedCuartos[1].w! },
            { id: 's2', t1: simulatedCuartos[2].w!, t2: simulatedCuartos[3].w! }
          ];
          return { ...prev, cuartos: simulatedCuartos, semis: nextSemis };
        });
        setTournamentStage('SEMIS');
      } else {
        setBracket(prev => prev ? { ...prev, cuartos: simulatedCuartos } : null);
        setTournamentStatus('ELIMINATED');
      }
    } 
    else if (tournamentStage === 'SEMIS') {
      const simulatedSemis = bracket.semis.map(match => {
        const p1 = getTeamRating(match.t1);
        const p2 = getTeamRating(match.t2);
        const sim = simulateMatch(p1, p2, match.t1, match.t2, false);
        return { ...match, score1: sim.homeScore, score2: sim.awayScore, w: sim.winnerName };
      });

      const userMatch = simulatedSemis[0];
      setMatchesLog(prev => [...prev, { id: userMatch.id, homeTeamName: userMatch.t1, awayTeamName: userMatch.t2, homeScore: userMatch.score1!, awayScore: userMatch.score2!, isCompleted: true, winnerName: userMatch.w! }]);

      if (userMatch.w === userTeamNameLabel) {
        setBracket(prev => {
          if (!prev) return null;
          const nextFinal = { id: 'f1', t1: simulatedSemis[0].w!, t2: simulatedSemis[1].w! };
          return { ...prev, semis: simulatedSemis, final: nextFinal };
        });
        setTournamentStage('FINAL');
      } else {
        setBracket(prev => prev ? { ...prev, semis: simulatedSemis } : null);
        setTournamentStatus('ELIMINATED');
      }
    } 
    else if (tournamentStage === 'FINAL') {
      const m = bracket.final;
      const sim = simulateMatch(getTeamRating(m.t1), getTeamRating(m.t2), m.t1, m.t2, false);
      const simulatedFinal = { ...m, score1: sim.homeScore, score2: sim.awayScore, w: sim.winnerName };

      setMatchesLog(prev => [...prev, { id: m.id, homeTeamName: m.t1, awayTeamName: m.t2, homeScore: sim.homeScore, awayScore: sim.awayScore, isCompleted: true, winnerName: sim.winnerName }]);
      setBracket(prev => prev ? { ...prev, final: simulatedFinal } : null);

      if (simulatedFinal.w === userTeamNameLabel) {
        setTournamentStatus('CHAMPION');
        logTournamentStat('win', userTeamNameLabel);
      } else {
        setTournamentStatus('ELIMINATED');
      }
    }
  };

  const totalSelected = Object.values(lineup).filter((slot) => slot.selectedPlayer).length;
  const totalPositionsInFormation = Object.values(lineup).length;

  return {
    currentFormation, setCurrentFormation, lineup, setLineup, view, setView, userRating, matchesLog, setMatchesLog,
    tournamentStage, setTournamentStage, tournamentStatus, setTournamentStatus, groupTeams, bracket, activeSlot, setActiveSlot,
    currentCountryOptions, setCurrentCountryOptions, draftCandidates, setDraftCandidates, userTeamNameLabel, setUserTeamNameLabel, totalSelected,
    totalPositionsInFormation, initTournamentStructure, handleSlotClick, handleSelectPlayer, handleNextRonda
  };
}