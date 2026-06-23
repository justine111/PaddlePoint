// src/screens/TournamentScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createTournament, listTournaments, subscribeToTournament } from '../services/tournamentService';
import { useAuth } from '../context/AuthContext';
import BracketView from '../components/BracketView';

export default function TournamentScreen({ navigation }) {
  const { user } = useAuth();
  const [view, setView]                       = useState('list');
  const [tournaments, setTournaments]         = useState([]);
  const [activeTournament, setActiveTournament] = useState(null);

  // Create form
  const [name, setName]             = useState('');
  const [type, setType]             = useState('singles');
  const [playerInput, setPlayerInput] = useState('');
  const [players, setPlayers]       = useState([]);

  useEffect(() => {
    if (user && view === 'list') listTournaments(user.uid).then(setTournaments);
  }, [user, view]);

  useEffect(() => {
    if (!activeTournament?.id) return;
    const unsub = subscribeToTournament(activeTournament.id, setActiveTournament);
    return unsub;
  }, [activeTournament?.id]);

  const addPlayer = () => {
    if (!playerInput.trim()) return;
    setPlayers(p => [...p, playerInput.trim()]);
    setPlayerInput('');
  };

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('Enter a tournament name'); return; }
    if (players.length < 2) { Alert.alert('Add at least 2 players/teams'); return; }
    try {
      const id = await createTournament({ name: name.trim(), players, type, createdBy: user?.uid });
      setActiveTournament({ id, name, players, type, bracket: [], currentRound: 0, status: 'active' });
      setView('bracket');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  // ── Bracket view ──────────────────────────────────────────────────────────
  if (view === 'bracket' && activeTournament) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setView('list'); setActiveTournament(null); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{activeTournament.name}</Text>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{activeTournament.type}</Text>
          </View>
        </View>
        <BracketView
          tournament={activeTournament}
          onMatchPress={(matchId, round) =>
            navigation.navigate('Scoring', { matchId, tournamentId: activeTournament.id, round })
          }
        />
      </SafeAreaView>
    );
  }

  // ── Create form ───────────────────────────────────────────────────────────
  if (view === 'create') {
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(Math.max(players.length, 2))));
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Tournament</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <TextInput style={styles.input} placeholder="Tournament name"
            placeholderTextColor="#444" value={name} onChangeText={setName} />

          <View style={styles.typeRow}>
            {['singles', 'doubles'].map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                onPress={() => setType(t)}>
                <Ionicons name={t === 'singles' ? 'person' : 'people'} size={16}
                  color={type === t ? '#fff' : '#666'} />
                <Text style={[styles.typeBtnText, type === t && { color: '#fff' }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.playersLabel}>
            Players ({players.length})
            {players.length >= 2 && (
              <Text style={styles.bracketNote}> → {bracketSize}-player bracket</Text>
            )}
          </Text>

          <View style={styles.addRow}>
            <TextInput style={[styles.input, { flex: 1 }]}
              placeholder={type === 'doubles' ? 'Team name' : 'Player name'}
              placeholderTextColor="#444"
              value={playerInput} onChangeText={setPlayerInput}
              onSubmitEditing={addPlayer} returnKeyType="done" />
            <TouchableOpacity style={styles.addBtn} onPress={addPlayer}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {players.map((p, i) => (
            <View key={i} style={styles.playerRow}>
              <Text style={styles.playerNum}>{i + 1}</Text>
              <Text style={styles.playerName}>{p}</Text>
              <TouchableOpacity onPress={() => setPlayers(arr => arr.filter((_, j) => j !== i))}>
                <Ionicons name="close-circle" size={18} color="#444" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.createBtn, players.length < 2 && { opacity: 0.5 }]}
            onPress={handleCreate}
            disabled={players.length < 2}
          >
            <Ionicons name="trophy" size={20} color="#fff" />
            <Text style={styles.createBtnText}>Generate Bracket</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tournaments</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => {
          setName(''); setPlayers([]); setPlayerInput(''); setView('create');
        }}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {tournaments.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={48} color="#2a2a2a" />
          <Text style={styles.emptyText}>No tournaments yet</Text>
          <TouchableOpacity onPress={() => setView('create')}>
            <Text style={styles.emptyLink}>Create one →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={t => t.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => { setActiveTournament(item); setView('bracket'); }}
            >
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.type} · {item.players?.length} players</Text>
              <View style={[styles.statusBadge,
                { backgroundColor: item.status === 'active' ? '#1a3a1a' : '#1a1a2a' }]}>
                <Text style={[styles.statusText,
                  { color: item.status === 'active' ? '#4caf50' : '#7986cb' }]}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
  backBtn: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1, marginLeft: 4 },
  typePill: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: '#1a1a2a', borderRadius: 8,
  },
  typePillText: { color: '#7986cb', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1565c0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  newBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  form: { padding: 20, gap: 12, paddingBottom: 48 },
  input: {
    backgroundColor: '#141414', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 15, borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 11, borderRadius: 12,
    backgroundColor: '#141414', borderWidth: 1, borderColor: '#2a2a2a',
  },
  typeBtnActive: { backgroundColor: '#1565c0', borderColor: '#1565c0' },
  typeBtnText: { color: '#666', fontSize: 14, fontWeight: '600' },
  playersLabel: { color: '#888', fontSize: 13, fontWeight: '600' },
  bracketNote: { color: '#4fc3f7' },
  addRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  addBtn: {
    width: 46, height: 46, backgroundColor: '#1565c0',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#141414', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  playerNum: { color: '#444', fontSize: 13, width: 18 },
  playerName: { color: '#ccc', fontSize: 14, flex: 1 },
  createBtn: {
    marginTop: 4, backgroundColor: '#1565c0', borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 10,
  },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#444', fontSize: 15 },
  emptyLink: { color: '#4fc3f7', fontSize: 14 },

  card: {
    backgroundColor: '#111', borderRadius: 14, padding: 16,
    borderWidth: 0.5, borderColor: '#222', gap: 4,
  },
  cardName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardMeta: { color: '#555', fontSize: 13, textTransform: 'capitalize' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginTop: 4 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});
