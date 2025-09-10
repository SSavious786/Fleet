import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

export default function SplashScreen({ onFinish = null }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1500); // Show splash for 1.5 seconds
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/darklogo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.tagline}>TrackIO - Control, Track, and Optimize Your Fleet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1edc89',
  },
  logo: {
    width: 180,
    height: 180,
  },
  tagline: {
    color: '#fff',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 24,
  },
}); 