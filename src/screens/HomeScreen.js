// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import { format } from 'date-fns';

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, COLLECTIONS.MATCHES),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5),
    );
    getDocs(q).then(snap =>
      setRecent(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [user]);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {user?.displayName || 'Player'} 🏓</Text>
          <Text style={styles.sub}>Ready to play?</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Quick start */}
      <TouchableOpacity
        style={styles.newMatchBtn}
        onPress={() => navigation.navigate('MatchSetup')}
        activeOpacity={0.85}
      >
        <View style={styles.newMatchIcon}>
          <Ionicons name="add-circle" size={28} color="#fff" />
        </View>
        <View>
          <Text style={styles.newMatchTitle}>New Match</Text>
          <Text style={styles.newMatchSub}>Singles or doubles · Custom rules</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4fc3f7" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      {/* Recent matches */}
      <Text style={styles.sectionTitle}>Recent Matches</Text>

      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="tennisball-outline" size={40} color="#2a2a2a" />
          <Text style={styles.emptyText}>No matches yet</Text>
        </View>
      ) : (
        <FlatList
          data={recent}
          keyExtractor={m => m.id}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          renderItem={({ item: m }) => {
            const date = m.createdAt?.toDate?.();
            return (
              <TouchableOpacity
                style={styles.matchCard}
                onPress={() =>
                  m.status === 'active'
                    ? navigation.navigate('Scoring', { matchId: m.id })
                    : navigation.navigate('MatchResult', { matchId: m.id, winner: m.winner })
                }
              >
                <View style={styles.matchTeams}>
                  <Text style={styles.teamA}>{m.teamA?.name}</Text>
                  <Text style={styles.vsLabel}>vs</Text>
                  <Text style={styles.teamB}>{m.teamB?.name}</Text>
                </View>
                <View style={styles.matchMeta}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: m.status === 'active' ? '#4caf50' : '#555' },
                  ]} />
                  <Text style={styles.metaText}>
                    {m.status === 'active' ? 'Live' : 'Finished'}
                    {date ? ` · ${format(date, 'MMM d')}` : ''}
                  </Text>
                  <Text style={styles.metaScore}>
                    {m.teamA?.score} – {m.teamB?.score}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: '#555', fontSize: 14, marginTop: 2 },
  signOutBtn: { padding: 8 },

  newMatchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    margin: 20, backgroundColor: '#0d2340',
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#1565c0',
  },
  newMatchIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#1565c0', alignItems: 'center', justifyContent: 'center',
  },
  newMatchTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  newMatchSub: { color: '#4fc3f7', fontSize: 13, marginTop: 2 },

  sectionTitle: {
    color: '#666', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: 20, marginBottom: 10,
  },

  empty: { alignItems: 'center', marginTop: 40, gap: 10 },
  emptyText: { color: '#333', fontSize: 15 },

  matchCard: {
    backgroundColor: '#111', borderRadius: 14, padding: 14,
    borderWidth: 0.5, borderColor: '#222', gap: 8,
  },
  matchTeams: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamA: { color: '#4fc3f7', fontSize: 15, fontWeight: '700', flex: 1 },
  vsLabel: { color: '#444', fontSize: 12 },
  teamB: { color: '#ff7043', fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'right' },
  matchMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  metaText: { color: '#555', fontSize: 12, flex: 1 },
  metaScore: { color: '#888', fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
