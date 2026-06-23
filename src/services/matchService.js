// src/services/matchService.js
import {
  collection, doc, addDoc, getDoc, updateDoc, onSnapshot,
  arrayUnion, serverTimestamp, setDoc,
} from 'firebase/firestore';
import { db, COLLECTIONS, MATCH_STATUS, MATCH_TYPE, CAST_BASE_URL } from './firebase';

const matchCol = () => collection(db, COLLECTIONS.MATCHES);
const matchDoc = id => doc(db, COLLECTIONS.MATCHES, id);
const castDoc = id => doc(db, COLLECTIONS.CAST_SESSIONS, id);

// ── Create ────────────────────────────────────────────────────────────────────

export async function createMatch({ type, teamA, teamB, pointsToWin = 11, winByTwo = true, createdBy }) {
  const ref = await addDoc(matchCol(), {
    type,
    teamA: { name: teamA.name, players: teamA.players, score: 0 },
    teamB: { name: teamB.name, players: teamB.players, score: 0 },
    servingTeam: 'A',
    servingPlayer: 0,
    set: 1,
    sets: { A: 0, B: 0 },
    status: MATCH_STATUS.ACTIVE,
    pointsToWin,
    winByTwo,
    winner: null,
    scoreHistory: [],
    createdBy: createdBy ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ── Score a point ─────────────────────────────────────────────────────────────

export async function addPoint(matchId, scoringTeam) {
  const ref = matchDoc(matchId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Match not found');

  const match = snap.data();
  const { teamA, teamB, servingTeam, sets, pointsToWin, winByTwo, set } = match;

  // Pickleball: only serving team scores; otherwise it's a side-out
  if (scoringTeam !== servingTeam) {
    await sideOut(matchId);
    return { sideOut: true };
  }

  const newA = scoringTeam === 'A' ? teamA.score + 1 : teamA.score;
  const newB = scoringTeam === 'B' ? teamB.score + 1 : teamB.score;

  const historyEntry = { scoringTeam, scoreA: newA, scoreB: newB, timestamp: Date.now() };

  const winnerScore = scoringTeam === 'A' ? newA : newB;
  const loserScore  = scoringTeam === 'A' ? newB : newA;
  const hasWonSet   = winnerScore >= pointsToWin && (!winByTwo || winnerScore - loserScore >= 2);

  if (hasWonSet) {
    const newSets = { ...sets, [scoringTeam]: sets[scoringTeam] + 1 };
    const isMatchOver = newSets[scoringTeam] >= 2; // best of 3 sets

    await updateDoc(ref, {
      'teamA.score': 0,
      'teamB.score': 0,
      sets: newSets,
      set: isMatchOver ? set : set + 1,
      status: isMatchOver ? MATCH_STATUS.COMPLETED : MATCH_STATUS.ACTIVE,
      winner: isMatchOver ? scoringTeam : null,
      servingTeam: scoringTeam,
      servingPlayer: 0,
      scoreHistory: arrayUnion(historyEntry),
      updatedAt: serverTimestamp(),
    });
    return { setWon: true, matchOver: isMatchOver, winner: scoringTeam };
  }

  await updateDoc(ref, {
    'teamA.score': newA,
    'teamB.score': newB,
    scoreHistory: arrayUnion(historyEntry),
    updatedAt: serverTimestamp(),
  });

  return { setWon: false, matchOver: false };
}

// ── Side-out ──────────────────────────────────────────────────────────────────

export async function sideOut(matchId) {
  const ref = matchDoc(matchId);
  const snap = await getDoc(ref);
  const { servingTeam } = snap.data();
  await updateDoc(ref, {
    servingTeam: servingTeam === 'A' ? 'B' : 'A',
    servingPlayer: 0,
    updatedAt: serverTimestamp(),
  });
}

// ── Rotate server within a doubles team ───────────────────────────────────────

export async function rotateServer(matchId) {
  const ref = matchDoc(matchId);
  const snap = await getDoc(ref);
  const { servingPlayer } = snap.data();
  if (servingPlayer === 1) return sideOut(matchId);
  await updateDoc(ref, { servingPlayer: 1, updatedAt: serverTimestamp() });
}

// ── Undo last scored point ────────────────────────────────────────────────────

export async function undoLastPoint(matchId) {
  const ref = matchDoc(matchId);
  const snap = await getDoc(ref);
  const { scoreHistory } = snap.data();
  if (!scoreHistory.length) return;

  const newHistory = scoreHistory.slice(0, -1);
  const prev = newHistory[newHistory.length - 1];

  await updateDoc(ref, {
    'teamA.score': prev?.scoreA ?? 0,
    'teamB.score': prev?.scoreB ?? 0,
    scoreHistory: newHistory,
    updatedAt: serverTimestamp(),
  });
}

// ── Real-time listener ────────────────────────────────────────────────────────

export function subscribeToMatch(matchId, callback) {
  return onSnapshot(matchDoc(matchId), snap => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

// ── Cast session (QR) ─────────────────────────────────────────────────────────

export async function createCastSession(matchId) {
  const qrUrl = `${CAST_BASE_URL}/cast/${matchId}`;
  await setDoc(castDoc(matchId), {
    matchId,
    qrUrl,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return qrUrl;
}
