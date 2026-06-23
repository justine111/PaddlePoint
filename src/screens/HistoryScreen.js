// src/screens/HistoryScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) return;
    const q = query(
      collection(db, COLLECTIONS.MATCHES),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(30),
    );
    const snap = await getDocs(q);
    setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { load(); }, [user]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item: m }) => {
    const date = m.createdAt?.toDate?.();
    const isLive = m.status === 'active';
    const winnerTeam = m.winner === 'A' ? m.teamA?.name : m.winner === 'B' ? m.teamB?.name : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          isLive
            ? navigation.navigate('Scoring', { matchId: m.id })
            : navigation.navigate('MatchResult', { matchId: m.id, winner: m.winner })
        }
      >
        <View style={styles.cardTop}>
          <View style={[styles.badge, isLive ? styles.badgeLive : styles.badgeDone]}>
            {isLive && <View style={styles.liveDot} />}
            <Text style={[styles.badgeText, isLive ? styles.badgeTextLive : styles.badgeTextDone]}>
              {isLive ? 'LIVE' : 'DONE'}
            </Text>
          </View>
          <Text style={styles.typeLabel}>{m.type}</Text>
          {date && <Text style={styles.dateLabel}>{format(date, 'MMM d, h:mm a')}</Text>}
        </View>

        <View style={styles.teams}>
          <View style={styles.teamBlock}>
            <Text style={[styles.teamName, { color: '#4fc3f7' }]}>{m.teamA?.name}</Text>
            <Text style={[styles.setScore, m.winner === 'A' && styles.setScoreWin]}>{m.sets?.A ?? 0}</Text>
          </View>
          <Text style={styles.vs}>–</Text>
          <View style={[styles.teamBlock, { alignItems: 'flex-end' }]}>
            <Text style={[styles.teamName, { color: '#ff7043' }]}>{m.teamB?.name}</Text>
            <Text style={[styles.setScore, m.winner === 'B' && styles.setScoreWin]}>{m.sets?.B ?? 0}</Text>
          </View>
        </View>

        {winnerTeam && (
          <Text style={styles.winnerLabel}>🏆 {winnerTeam} won</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={44} color="#2a2a2a" />
          <Text style={styles.emptyText}>No matches yet</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={m => m.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#555" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderColor: '#1a1a1a',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  refreshBtn: { padding: 6 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#444', fontSize: 15 },

  card: {
    backgroundColor: '#111', borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 0.5, borderColor: '#222',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  badgeLive: { backgroundColor: '#1a3a1a' },
  badgeDone: { backgroundColor: '#1a1a1a' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  badgeTextLive: { color: '#4caf50' },
  badgeTextDone: { color: '#444' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4caf50' },
  typeLabel: { color: '#555', fontSize: 12, textTransform: 'capitalize' },
  dateLabel: { color: '#444', fontSize: 11, marginLeft: 'auto' },

  teams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamBlock: { flex: 1, gap: 2 },
  teamName: { fontSize: 16, fontWeight: '700' },
  setScore: { color: '#555', fontSize: 22, fontWeight: '900', fontVariant: ['tabular-nums'] },
  setScoreWin: { color: '#ffd54f' },
  vs: { color: '#333', fontSize: 18, marginHorizontal: 8 },

  winnerLabel: { color: '#777', fontSize: 12 },
});
