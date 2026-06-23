// src/screens/ScoringScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  StatusBar, ScrollView, SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useMatch } from '../hooks/useMatch';
import QRModal from '../components/QRModal';
import ServeIndicator from '../components/ServeIndicator';
import { createCastSession } from '../services/matchService';

export default function ScoringScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { match, loading, scorePoint, changeSide, undo, nextServer } = useMatch(matchId);

  const [qrVisible, setQrVisible]   = useState(false);
  const [castUrl, setCastUrl]       = useState('');

  // Auto-navigate when match ends
  useEffect(() => {
    if (match?.status === 'completed') {
      navigation.replace('MatchResult', { matchId, winner: match.winner });
    }
  }, [match?.status]);

  const handleScore = useCallback(async team => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await scorePoint(team);

    if (result?.sideOut) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (result?.setWon) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        `Set to Team ${result.winner}!`,
        result.matchOver ? 'Match complete!' : 'Starting next set…',
        [{ text: 'Continue' }],
      );
    }
  }, [scorePoint]);

  const handleCast = async () => {
    let url = castUrl;
    if (!url) {
      url = await createCastSession(matchId);
      setCastUrl(url);
    }
    setQrVisible(true);
  };

  const confirmUndo = () => {
    Alert.alert('Undo last point?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Undo', style: 'destructive', onPress: undo },
    ]);
  };

  if (loading || !match) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>Loading…</Text>
      </View>
    );
  }

  const { teamA, teamB, servingTeam, servingPlayer, sets, set, type, scoreHistory = [] } = match;
  const isDoubles = type === 'doubles';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.setLabel}>Set {set}</Text>
          <View style={styles.setsRow}>
            <Text style={styles.setsA}>{sets.A}</Text>
            <Text style={styles.setsDash}>–</Text>
            <Text style={styles.setsB}>{sets.B}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={confirmUndo} style={styles.iconBtn}>
            <Ionicons name="arrow-undo" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCast} style={styles.iconBtn}>
            <Ionicons name="cast" size={20} color="#4fc3f7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Score Panel ── */}
      <View style={styles.scorePanel}>

        {/* Team A */}
        <View style={styles.teamSide}>
          <ServeIndicator active={servingTeam === 'A'} />
          <Text style={styles.teamName} numberOfLines={1}>{teamA.name}</Text>
          {isDoubles && (
            <Text style={styles.playerNames}>
              {teamA.players[0]} · {teamA.players[1]}
              {servingTeam === 'A' && (
                <Text style={styles.serverHighlight}> ({teamA.players[servingPlayer]}*)</Text>
              )}
            </Text>
          )}

          <TouchableOpacity
            style={styles.scoreTouchA}
            onPress={() => handleScore('A')}
            activeOpacity={0.7}
          >
            <Text style={styles.scoreNumA}>{teamA.score}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pointBtn, { backgroundColor: '#1565c0' }]}
            onPress={() => handleScore('A')} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.pointBtnText}>Point</Text>
          </TouchableOpacity>
        </View>

        {/* Center divider */}
        <View style={styles.center}>
          <Text style={styles.centerDash}>:</Text>
          <TouchableOpacity style={styles.sideOutBtn} onPress={changeSide}>
            <Ionicons name="swap-horizontal" size={14} color="#555" />
            <Text style={styles.sideOutText}>Side out</Text>
          </TouchableOpacity>
          {isDoubles && (
            <TouchableOpacity style={styles.rotateBtn} onPress={nextServer}>
              <Ionicons name="reload" size={14} color="#555" />
              <Text style={styles.sideOutText}>Next server</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Team B */}
        <View style={styles.teamSide}>
          <ServeIndicator active={servingTeam === 'B'} />
          <Text style={styles.teamName} numberOfLines={1}>{teamB.name}</Text>
          {isDoubles && (
            <Text style={styles.playerNames}>
              {teamB.players[0]} · {teamB.players[1]}
              {servingTeam === 'B' && (
                <Text style={styles.serverHighlight}> ({teamB.players[servingPlayer]}*)</Text>
              )}
            </Text>
          )}

          <TouchableOpacity
            style={styles.scoreTouchB}
            onPress={() => handleScore('B')}
            activeOpacity={0.7}
          >
            <Text style={styles.scoreNumB}>{teamB.score}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pointBtn, { backgroundColor: '#bf360c' }]}
            onPress={() => handleScore('B')} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.pointBtnText}>Point</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── History strip ── */}
      <View style={styles.historyBar}>
        <Ionicons name="time-outline" size={13} color="#333" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {scoreHistory.slice(-12).reverse().map((h, i) => (
            <Text
              key={i}
              style={[styles.histChip, { color: h.scoringTeam === 'A' ? '#4fc3f7' : '#ff7043' }]}
            >
              {h.scoreA}–{h.scoreB}
            </Text>
          ))}
        </ScrollView>
      </View>

      <QRModal visible={qrVisible} url={castUrl} onClose={() => setQrVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  loaderText: { color: '#fff', fontSize: 16 },

  // header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 10,
    borderBottomWidth: 0.5, borderColor: '#1a1a1a',
  },
  iconBtn: { padding: 10 },
  headerCenter: { alignItems: 'center' },
  setLabel: { color: '#666', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  setsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  setsA: { color: '#4fc3f7', fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  setsB: { color: '#ff7043', fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  setsDash: { color: '#444', fontSize: 16 },
  headerActions: { flexDirection: 'row' },

  // score panel
  scorePanel: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 6, paddingVertical: 8, gap: 4,
  },
  teamSide: { flex: 1, alignItems: 'center', gap: 8 },

  teamName: {
    color: '#fff', fontSize: 16, fontWeight: '700',
    textAlign: 'center', paddingHorizontal: 4,
  },
  playerNames: { color: '#555', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  serverHighlight: { color: '#ffd54f', fontSize: 11 },

  scoreTouchA: {
    width: '100%', aspectRatio: 1, maxHeight: 180,
    backgroundColor: '#0d2340', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#1565c0',
  },
  scoreTouchB: {
    width: '100%', aspectRatio: 1, maxHeight: 180,
    backgroundColor: '#1a0a06', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#bf360c',
  },
  scoreNumA: {
    color: '#4fc3f7', fontSize: 80, fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  scoreNumB: {
    color: '#ff7043', fontSize: 80, fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },

  pointBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 24, width: '85%', justifyContent: 'center',
  },
  pointBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // center
  center: { alignItems: 'center', gap: 10 },
  centerDash: { color: '#2a2a2a', fontSize: 36, fontWeight: '200' },
  sideOutBtn: {
    alignItems: 'center', gap: 3,
    paddingVertical: 7, paddingHorizontal: 8,
    backgroundColor: '#141414', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  rotateBtn: {
    alignItems: 'center', gap: 3,
    paddingVertical: 7, paddingHorizontal: 8,
    backgroundColor: '#141414', borderRadius: 10,
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  sideOutText: { color: '#555', fontSize: 10, fontWeight: '500' },

  // history
  historyBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderTopWidth: 0.5, borderColor: '#141414',
    minHeight: 36,
  },
  histChip: { fontSize: 12, marginRight: 10, fontVariant: ['tabular-nums'] },
});
