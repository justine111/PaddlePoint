// src/screens/MatchResultScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToMatch } from '../services/matchService';

export default function MatchResultScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const unsub = subscribeToMatch(matchId, setMatch);
    return unsub;
  }, [matchId]);

  if (!match) return null;

  const { teamA, teamB, winner, sets, scoreHistory = [], type } = match;
  const winTeam  = winner === 'A' ? teamA : teamB;
  const loseTeam = winner === 'A' ? teamB : teamA;
  const totalPoints = scoreHistory.length;

  const shareResult = async () => {
    const text =
      `🏓 Match Result\n` +
      `🏆 ${winTeam.name} won!\n` +
      `Sets: ${sets.A} – ${sets.B}\n` +
      `Total rallies: ${totalPoints}`;
    await Share.share({ message: text });
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.inner}>

        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.wonLabel}>Match Complete</Text>
        <Text style={styles.winner}>{winTeam.name} wins!</Text>

        {type === 'doubles' && (
          <Text style={styles.players}>{winTeam.players.join(' & ')}</Text>
        )}

        {/* Score summary */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreName, winner === 'A' && styles.scoreNameWin]}>{teamA.name}</Text>
            <Text style={[styles.scoreNum, winner === 'A' && styles.scoreNumWin]}>{sets.A}</Text>
          </View>
          <Text style={styles.scoreDash}>–</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreName, winner === 'B' && styles.scoreNameWin]}>{teamB.name}</Text>
            <Text style={[styles.scoreNum, winner === 'B' && styles.scoreNumWin]}>{sets.B}</Text>
          </View>
        </View>

        <Text style={styles.meta}>{totalPoints} total points played</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('MatchSetup')}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>New Match</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={shareResult}>
            <Ionicons name="share-outline" size={20} color="#aaa" />
            <Text style={styles.secondaryBtnText}>Share Result</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.ghostBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 28, gap: 12,
  },
  trophy: { fontSize: 64 },
  wonLabel: { color: '#666', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' },
  winner: { color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'center' },
  players: { color: '#4fc3f7', fontSize: 15, textAlign: 'center' },

  scoreCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#111', borderRadius: 18, paddingHorizontal: 28, paddingVertical: 16,
    marginVertical: 8, borderWidth: 0.5, borderColor: '#222', width: '100%',
    justifyContent: 'center',
  },
  scoreRow: { alignItems: 'center', gap: 4 },
  scoreName: { color: '#555', fontSize: 14, fontWeight: '600' },
  scoreNameWin: { color: '#fff' },
  scoreNum: { color: '#444', fontSize: 40, fontWeight: '900', fontVariant: ['tabular-nums'] },
  scoreNumWin: { color: '#ffd54f' },
  scoreDash: { color: '#2a2a2a', fontSize: 30 },

  meta: { color: '#444', fontSize: 13 },

  actions: { width: '100%', gap: 10, marginTop: 12 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1565c0', borderRadius: 16, paddingVertical: 15,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#141414', borderRadius: 16, paddingVertical: 14,
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  secondaryBtnText: { color: '#aaa', fontSize: 15, fontWeight: '600' },
  ghostBtn: { alignItems: 'center', paddingVertical: 10 },
  ghostBtnText: { color: '#444', fontSize: 14 },
});
