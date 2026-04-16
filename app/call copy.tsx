import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@/components/ui/Icon';
import { Fonts } from '@/constants/Fonts';
import { useGeminiLiveCall } from '@/hooks/useGeminiLiveCall';

export default function CallScreen() {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { callStatus } = useGeminiLiveCall();

  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  // ── Duration timer ─────────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const timer = setInterval(() => setCallDuration((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Orb animation based on call status ────────────────────────────────────
  useEffect(() => {
    pulseAnim.stopAnimation();
    glowOpacity.stopAnimation();

    if (callStatus === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1,  duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        ])
      ).start();

    } else if (callStatus === 'listening') {
      // Gentle breathing
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(glowOpacity, { toValue: 0.55, duration: 400, useNativeDriver: true }).start();

    } else if (callStatus === 'speaking') {
      // Energetic pulse when AI is talking
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.28, duration: 280, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.1,  duration: 280, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.8, duration: 280, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.5, duration: 280, useNativeDriver: true }),
        ])
      ).start();

    } else if (callStatus === 'interrupted') {
      // Quick shrink flash when user interrupts AI
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]).start();
      Animated.timing(glowOpacity, { toValue: 0.4, duration: 300, useNativeDriver: true }).start();
    }
  }, [callStatus]);

  // ── Continuous slow rotation ───────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ── Orb gradient colours per status ───────────────────────────────────────
  const orbColors: Record<string, [string, string, string]> = {
    connecting:  ['#4285F4', '#9B72CB', '#D96570'],
    listening:   ['#34A853', '#4285F4', '#9B72CB'],
    speaking:    ['#9B72CB', '#D96570', '#FBBC04'],
    interrupted: ['#D96570', '#FBBC04', '#4285F4'],
  };
  const currentColors = orbColors[callStatus] ?? orbColors.connecting;

  // ── Status label ───────────────────────────────────────────────────────────
  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':  return 'Connecting…';
      case 'listening':   return 'Listening…';
      case 'speaking':    return 'Capitec AI is speaking…';
      case 'interrupted': return 'Go ahead…';
    }
  };

  const handleEndCall = () => router.back();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Capitec AI Assistant</Text>
        <View style={styles.statusRow}>
          {/* Live indicator dot */}
          <View style={[
            styles.statusDot,
            { backgroundColor: callStatus === 'speaking' ? '#34A853' : callStatus === 'listening' ? '#4285F4' : '#888' }
          ]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Orb */}
      <View style={styles.orbContainer}>
        {/* Outer glow ring */}
        <Animated.View style={[styles.glowLayer, { transform: [{ scale: pulseAnim }], opacity: glowOpacity }]} />

        {/* Orb itself */}
        <Animated.View style={[styles.orb, { transform: [{ scale: pulseAnim }, { rotate: spin }] }]}>
          <LinearGradient
            colors={currentColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          />
        </Animated.View>
      </View>

      {/* Footer controls */}
      <View style={styles.footer}>
        <Text style={styles.duration}>{formatTime(callDuration)}</Text>

        <View style={styles.controlsRow}>
          {/* Mute toggle */}
          <TouchableOpacity
            style={[styles.iconButton, isMuted && styles.iconButtonActive]}
            activeOpacity={0.7}
            onPress={() => setIsMuted((m) => !m)}
            accessibilityLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            <Icon name={isMuted ? 'mic-off' : 'mic'} type="Feather" size={24} color={isMuted ? '#FF3B30' : '#fff'} />
          </TouchableOpacity>

          {/* End call */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
            activeOpacity={0.8}
            accessibilityLabel="End call"
          >
            <Icon name="phone-off" type="Feather" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Speaker placeholder */}
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} accessibilityLabel="Speaker volume">
            <Icon name="volume-2" type="Feather" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    gap: 10,
  },
  title: {
    fontFamily: Fonts.fontMedium,
    fontSize: 22,
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Fonts.fontRegular,
    fontSize: 15,
    color: '#A0A0A0',
  },
  orbContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowLayer: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#9B72CB',
    shadowColor: '#9B72CB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 20,
  },
  orb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    zIndex: 2,
  },
  orbGradient: {
    flex: 1,
  },
  footer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  duration: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    width: '100%',
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
});
