// src/services/tournamentService.js
import {
  collection, doc, addDoc, getDoc, updateDoc,
  onSnapshot, query, where, orderBy, limit, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';

const col = () => collection(db, COLLECTIONS.TOURNAMENTS);
const ref = id => doc(db, COLLECTIONS.TOURNAMENTS, id);

function generateBracket(players) {
  const size = Math.pow(2, Math.ceil(Math.log2(Math.max(players.length, 2))));
  const padded = [...players];
  while (padded.length < size) padded.push(null); // bye slots

  // Shuffle
  for (let i = padded.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [padded[i], padded[j]] = [padded[j], padded[i]];
  }

  const rounds = [];
  let current = padded;
  let roundNum = 0;
  while (current.length > 1) {
    const matches = [];
    for (let i = 0; i < current.length; i += 2) {
      const isBye = current[i + 1] === null;
      matches.push({
        id: `r${roundNum}-m${i / 2}-${Date.now()}`,
        playerA: current[i],
        playerB: current[i + 1],
        winner: isBye ? current[i] : null,
        scoreA: 0,
        scoreB: 0,
        status: isBye ? 'bye' : 'pending',
        matchId: null, // filled when a live match is started
      });
    }
    rounds.push(matches);
    current = matches.map(m => m.winner);
    roundNum++;
  }
  return rounds;
}

export async function createTournament({ name, players, type = 'singles', createdBy }) {
  const bracket = generateBracket(players);
  const d = await addDoc(col(), {
    name, players, type, bracket,
    currentRound: 0,
    status: 'active',
    createdBy: createdBy ?? null,
    createdAt: serverTimestamp(),
  });
  return d.id;
}

export async function recordTournamentResult(tournamentId, roundIndex, matchId, winner) {
  const r = ref(tournamentId);
  const snap = await getDoc(r);
  const { bracket } = snap.data();

  const updated = bracket.map((round, ri) => {
    if (ri !== roundIndex) return round;
    return round.map(m => m.id === matchId ? { ...m, winner, status: 'completed' } : m);
  });

  // If round complete, seed winners into next round
  const round = updated[roundIndex];
  const allDone = round.every(m => m.winner !== null);
  let currentRound = roundIndex;

  if (allDone && roundIndex + 1 < bracket.length) {
    const winners = round.map(m => m.winner);
    for (let i = 0; i < winners.length; i += 2) {
      const nextMatch = updated[roundIndex + 1][i / 2];
      nextMatch.playerA = winners[i];
      nextMatch.playerB = winners[i + 1] ?? null;
      if (!nextMatch.playerB) {
        nextMatch.winner = winners[i];
        nextMatch.status = 'bye';
      }
    }
    currentRound = roundIndex + 1;
  }

  await updateDoc(r, {
    bracket: updated,
    currentRound,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTournament(tournamentId, callback) {
  return onSnapshot(ref(tournamentId), snap => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

export async function listTournaments(userId) {
  const q = query(col(), where('createdBy', '==', userId), orderBy('createdAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
