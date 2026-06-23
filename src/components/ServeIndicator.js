// src/components/ServeIndicator.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, StyleSheet } from 'react-native';

export default function ServeIndicator({ active }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.4, duration: 500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1,   duration: 500, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      scale.setValue(1);
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [active]);

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.dot, { transform: [{ scale }], opacity }]} />
      <Animated.Text style={[styles.label, { opacity }]}>Serving</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 5, height: 18 },
  dot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffd54f' },
  label: { color: '#ffd54f', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
