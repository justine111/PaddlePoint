// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp, signInAnon } = useAuth();
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [isNew, setIsNew]   = useState(false);
  const [busy, setBusy]     = useState(false);

  const submit = async () => {
    if (!email.trim() || !pw.trim()) return;
    setBusy(true);
    try {
      isNew ? await signUp(email, pw) : await signIn(email, pw);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setBusy(false);
    }
  };

  const guestLogin = async () => {
    setBusy(true);
    try { await signInAnon(); }
    catch (e) { Alert.alert('Error', e.message); }
    finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>🏓</Text>
        <Text style={styles.title}>Pickleball Scorer</Text>
        <Text style={styles.sub}>Score. Cast. Play.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#555"
          value={pw}
          onChangeText={setPw}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={submit} disabled={busy}>
          <Text style={styles.btnText}>{isNew ? 'Create account' : 'Sign in'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsNew(v => !v)}>
          <Text style={styles.toggle}>
            {isNew ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.divLine} /><Text style={styles.divText}>or</Text><View style={styles.divLine} />
        </View>

        <TouchableOpacity style={styles.guestBtn} onPress={guestLogin} disabled={busy}>
          <Text style={styles.guestBtnText}>Continue as guest</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center' },
  inner: { paddingHorizontal: 28, alignItems: 'center', gap: 14 },
  emoji: { fontSize: 52 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  sub: { color: '#555', fontSize: 15, marginBottom: 8 },
  input: {
    width: '100%', backgroundColor: '#141414', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    color: '#fff', fontSize: 15, borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  btn: {
    width: '100%', backgroundColor: '#1565c0', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggle: { color: '#4fc3f7', fontSize: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  divLine: { flex: 1, height: 0.5, backgroundColor: '#2a2a2a' },
  divText: { color: '#555', fontSize: 13 },
  guestBtn: {
    width: '100%', borderRadius: 14, paddingVertical: 13, alignItems: 'center',
    borderWidth: 0.5, borderColor: '#2a2a2a',
  },
  guestBtnText: { color: '#aaa', fontSize: 15 },
});
