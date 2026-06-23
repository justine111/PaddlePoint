// src/components/BracketView.js
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CARD_W    = 136;
const CARD_H    = 62;
const H_SPACING = 52;
const V_GAP     = 10;

const ROUND_LABELS = ['Round 1', 'Quarterfinal', 'Semifinal', 'Final'];

export default function BracketView({ tournament, onMatchPress }) {
  const { bracket = [] } = tournament;
  if (!bracket.length) return (
    <View style={styles.empty}>
      <Ionicons name="hourglass-outline" size={36} color="#2a2a2a" />
      <Text style={styles.emptyText}>Bracket loading…</Text>
    </View>
  );

  const baseCount  = bracket[0].length;
  const totalHeight = baseCount * (CARD_H + V_GAP) + 40;

  return (
    <ScrollView horizontal contentContainerStyle={styles.container}>
      {bracket.map((round, ri) => {
        const count   = round.length;
        const spacing = (totalHeight - count * CARD_H) / (count + 1);

        return (
          <View key={ri} style={[styles.column, { width: CARD_W + H_SPACING }]}>
            <Text style={styles.roundLabel}>
              {ROUND_LABELS[ri] ?? `Round ${ri + 1}`}
            </Text>
            {round.map((match, mi) => {
              const top = spacing + mi * (CARD_H + spacing);
              const isBye       = match.status === 'bye';
              const isCompleted = match.status === 'completed';
              const isPending   = match.status === 'pending';

              return (
                <TouchableOpacity
                  key={match.id}
                  style={[
                    styles.matchCard,
                    { top },
                    isCompleted && styles.matchCardDone,
                    isBye       && styles.matchCardBye,
                  ]}
                  onPress={() => !isBye && isPending === false && match.matchId
                    ? onMatchPress(match.matchId, ri)
                    : null
                  }
                  activeOpacity={isBye ? 1 : 0.75}
                >
                  {/* Player A row */}
                  <View style={[styles.playerRow, match.winner === match.playerA && styles.winnerRow]}>
                    <Text style={styles.playerText} numberOfLines={1}>
                      {match.playerA ?? '—'}
                    </Text>
                    {match.winner === match.playerA && (
                      <Ionicons name="checkmark" size={11} color="#4caf50" />
                    )}
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Player B row */}
                  <View style={[styles.playerRow, match.winner === match.playerB && styles.winnerRow]}>
                    <Text style={[styles.playerText, isBye && { color: '#333' }]} numberOfLines={1}>
                      {isBye ? 'BYE' : (match.playerB ?? 'TBD')}
                    </Text>
                    {match.winner === match.playerB && (
                      <Ionicons name="checkmark" size={11} color="#4caf50" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

      {/* Champion slot */}
      <View style={[styles.column, { width: CARD_W + H_SPACING }]}>
        <Text style={styles.roundLabel}>Champion</Text>
        {(() => {
          const last  = bracket[bracket.length - 1];
          const champ = last?.[0]?.winner;
          return (
            <View style={[styles.matchCard, styles.champCard, { top: (totalHeight - CARD_H) / 2 }]}>
              <Text style={styles.champEmoji}>🏆</Text>
              <Text style={styles.champName}>{champ ?? '?'}</Text>
            </View>
          );
        })()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 40 },
  emptyText: { color: '#333', fontSize: 14 },

  column: { position: 'relative', height: 500 },
  roundLabel: {
    color: '#555', fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.6,
    textAlign: 'center', marginBottom: 4,
  },

  matchCard: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  matchCardDone: { borderColor: '#1565c0' },
  matchCardBye:  { opacity: 0.45 },

  playerRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 9, gap: 4,
  },
  winnerRow: { backgroundColor: '#0d1a2a' },
  playerText: { color: '#aaa', fontSize: 11, flex: 1 },

  cardDivider: { height: 0.5, backgroundColor: '#222' },

  champCard: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a2a12', borderColor: '#2e7d32', gap: 4,
  },
  champEmoji: { fontSize: 20 },
  champName: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', paddingHorizontal: 6 },
});
