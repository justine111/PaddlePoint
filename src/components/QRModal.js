// src/components/QRModal.js
import React from 'react';
import {
  Modal, View, Text, StyleSheet,
  TouchableOpacity, Share, Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function QRModal({ visible, url, onClose }) {
  if (!url) return null;

  const copy = async () => {
    await Clipboard.setStringAsync(url);
    Alert.alert('Copied!', 'URL copied to clipboard.');
  };

  const share = () =>
    Share.share({ message: `📺 Live Pickleball Score: ${url}`, url });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.castIcon}>
              <Ionicons name="tv-outline" size={18} color="#4fc3f7" />
            </View>
            <Text style={styles.cardTitle}>Cast to TV / Monitor</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          <Text style={styles.instructions}>
            Open this URL on your TV browser or scan with your phone to display the live scoreboard.
          </Text>

          {/* QR Code */}
          <View style={styles.qrWrap}>
            <QRCode value={url} size={200} backgroundColor="#ffffff" color="#000000" />
          </View>

          {/* URL */}
          <TouchableOpacity style={styles.urlRow} onPress={copy}>
            <Text style={styles.urlText} numberOfLines={2}>{url}</Text>
            <Ionicons name="copy-outline" size={16} color="#4fc3f7" />
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareBtn} onPress={share}>
              <Ionicons name="share-social-outline" size={18} color="#fff" />
              <Text style={styles.shareBtnText}>Share link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.copyBtn} onPress={copy}>
              <Ionicons name="copy-outline" size={18} color="#aaa" />
              <Text style={styles.copyBtnText}>Copy URL</Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>How to cast</Text>
            <Text style={styles.tipLine}>📺  Open the URL in your Smart TV browser</Text>
            <Text style={styles.tipLine}>📱  Cast your phone screen via Chromecast or AirPlay</Text>
            <Text style={styles.tipLine}>💻  Open on a laptop and mirror to the monitor</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  card: {
    backgroundColor: '#111', borderRadius: 22, padding: 22, width: '100%',
    borderWidth: 0.5, borderColor: '#2a2a2a', gap: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  castIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#0d2340', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  closeBtn: { padding: 4 },

  instructions: { color: '#666', fontSize: 13, lineHeight: 19 },

  qrWrap: {
    alignSelf: 'center', padding: 14, backgroundColor: '#fff', borderRadius: 16,
  },

  urlRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0d1a2a', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 0.5, borderColor: '#1565c0',
  },
  urlText: { color: '#4fc3f7', fontSize: 12, flex: 1 },

  actions: { flexDirection: 'row', gap: 10 },
  shareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1565c0', borderRadius: 12, paddingVertical: 12,
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  copyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1a1a1a', borderRadius: 12, paddingVertical: 12,
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  copyBtnText: { color: '#aaa', fontSize: 14, fontWeight: '600' },

  tipsBox: {
    backgroundColor: '#0a0a0a', borderRadius: 12, padding: 14, gap: 6,
    borderWidth: 0.5, borderColor: '#1a1a1a',
  },
  tipsTitle: { color: '#666', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  tipLine: { color: '#555', fontSize: 12, lineHeight: 20 },
});
