// src/screens/MatchSetupScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createMatch } from '../services/matchService';
import { useAuth } from '../context/AuthContext';

const POINTS_OPTIONS = [11, 15, 21];

export default function MatchSetupScreen({ navigation }) {
  const { user } = useAuth();
  const [type, setType]           = useState('singles');
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [playersA, setPlayersA]   = useState(['', '']);
  const [playersB, setPlayersB]   = useState(['', '']);
  const [pointsToWin, setPoints]  = useState(11);
  const [winByTwo, setWinByTwo]   = useState(true);
  const [busy, setBusy]           = useState(false);

  const isDoubles = type === 'doubles';

  const updatePlayer = (team, idx, val) => {
    if (team === 'A') {
      const a = [...playersA]; a[idx] = val; setPlayersA(a);
    } else {
      const b = [...playersB]; b[idx] = val; setPlayersB(b);
    }
  };

  const validate = () => {
    if (!teamAName.trim() || !teamBName.trim()) {
      Alert.alert('Missing info', 'Enter a name for both teams.'); return false;
    }
    if (!playersA[0].trim() || !playersB[0].trim()) {
      Alert.alert('Missing info', 'Enter at least one player per team.'); return false;
    }
    if (isDoubles && (!playersA[1].trim() || !playersB[1].trim())) {
      Alert.alert('Missing info', 'Enter both players for doubles.'); return false;
    }
    return true;
  };

  const startMatch = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const matchId = await createMatch({
        type,
        teamA: {
          name: teamAName.trim(),
          players: isDoubles ? playersA.map(p => p.trim()) : [playersA[0].trim()],
        },
        teamB: {
          name: teamBName.trim(),
          players: isDoubles ? playersB.map(p => p.trim()) : [playersB[0].trim()],
        },
        pointsToWin,
        winByTwo,
        createdBy: user?.uid ?? null,
      });
      navigation.replace('Scoring', { matchId });
    } catch (e) {
      Alert.alert('Error', e.message);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>New Match</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Type selector */}
        <Text style={styles.label}>Match type</Text>
        <View style={styles.typeRow}>
          {[
            { key: 'singles', icon: 'person', label: 'Singles' },
            { key: 'doubles', icon: 'people', label: 'Doubles' },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, type === t.key && styles.typeBtnActive]}
              onPress={() => setType(t.key)}
            >
              <Ionicons name={t.icon} size={20} color={type === t.key ? '#fff' : '#666'} />
              <Text style={[styles.typeBtnText, type === t.key && { color: '#fff' }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Team A */}
        <View style={styles.teamCard}>
          <View style={styles.teamCardHeader}>
            <View style={[styles.dot, { backgroundColor: '#4fc3f7' }]} />
            <Text style={styles.teamCardTitle}>Team A</Text>
          </View>
          <TextInput style={styles.input} placeholder="Team name" placeholderTextColor="#444"
            value={teamAName} onChangeText={setTeamAName} />
          <TextInput style={styles.input} placeholder={isDoubles ? 'Player 1' : 'Player name'}
            placeholderTextColor="#444" value={playersA[0]} onChangeText={v => updatePlayer('A', 0, v)} />
          {isDoubles && (
            <TextInput style={styles.input} placeholder="Player 2" placeholderTextColor="#444"
              value={playersA[1]} onChangeText={v => updatePlayer('A', 1, v)} />
          )}
        </View>

        <View style={styles.vsRow}>
          <View style={styles.vsLine} /><Text style={styles.vsText}>VS</Text><View style={styles.vsLine} />
        </View>

        {/* Team B */}
        <View style={styles.teamCard}>
          <View style={styles.teamCardHeader}>
            <View style={[styles.dot, { backgroundColor: '#ff7043' }]} />
            <Text style={styles.teamCardTitle}>Team B</Text>
          </View>
          <TextInput style={styles.input} placeholder="Team name" placeholderTextColor="#444"
            value={teamBName} onChangeText={setTeamBName} />
          <TextInput style={styles.input} placeholder={isDoubles ? 'Player 1' : 'Player name'}
            placeholderTextColor="#444" value={playersB[0]} onChangeText={v => updatePlayer('B', 0, v)} />
          {isDoubles && (
            <TextInput style={styles.input} placeholder="Player 2" placeholderTextColor="#444"
              value={playersB[1]} onChangeText={v => updatePlayer('B', 1, v)} />
          )}
        </View>

        {/* Rules */}
        <Text style={styles.label}>Points to win</Text>
        <View style={styles.pointsRow}>
          {POINTS_OPTIONS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.pointBtn, pointsToWin === p && styles.pointBtnActive]}
              onPress={() => setPoints(p)}
            >
              <Text style={[styles.pointBtnText, pointsToWin === p && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Win by 2</Text>
            <Text style={styles.switchSub}>Must lead by 2 points to win</Text>
          </View>
          <Switch value={winByTwo} onValueChange={setWinByTwo}
            trackColor={{ true: '#1565c0', false: '#2a2a2a' }} thumbColor="#fff" />
        </View>

        <TouchableOpacity
          style={[styles.startBtn, busy && { opacity: 0.6 }]}
          onPress={startMatch}
          disabled={busy}
        >
          <Ionicons name="play-circle" size={22} color="#fff" />
          <Text style={styles.startBtnText}>{busy ? 'Starting…' : 'Start Match'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderColor: '#1a1a1a',
  },
  back: { padding: 8 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 48, gap: 14 },

  label: { color: '#888', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 14,
    backgroundColor: '#141414', borderWidth: 1, borderColor: '#2a2a2a',
  },
  typeBtnActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  typeBtnText: { color: '#666', fontSize: 15, fontWeight: '600' },

  teamCard: {
    backgroundColor: '#111', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 0.5, borderColor: '#222',
  },
  teamCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  teamCardTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },

  input: {
    backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 15, borderWidth: 0.5, borderColor: '#2a2a2a',
  },

  vsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vsLine: { flex: 1, height: 0.5, backgroundColor: '#222' },
  vsText: { color: '#444', fontSize: 13, fontWeight: '700' },

  pointsRow: { flexDirection: 'row', gap: 10 },
  pointBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#141414', borderWidth: 1, borderColor: '#2a2a2a',
  },
  pointBtnActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  pointBtnText: { color: '#666', fontSize: 20, fontWeight: '800' },

  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111', borderRadius: 14, padding: 16,
    borderWidth: 0.5, borderColor: '#222',
  },
  switchLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  switchSub: { color: '#555', fontSize: 12, marginTop: 2 },

  startBtn: {
    marginTop: 8, backgroundColor: '#1565c0', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
