import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import Icon from '@/components/ui/Icon';
import { Fonts } from '@/constants/Fonts';
import { useGeminiLiveCall } from '@/hooks/useGeminiLiveCall';

export default function CallScreen() {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);
  
  // Keep the Gemini Live logic running in the background as requested
  const { callStatus } = useGeminiLiveCall();
  const { topic } = useLocalSearchParams();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    const timer = setInterval(() => setCallDuration((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEndCall = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#f5f5f5' },
          headerShadowVisible: false,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={handleEndCall} style={{ paddingLeft: 10 }}>
              <Icon name="arrow-left" type="Feather" size={26} color="#00A3E0" />
            </TouchableOpacity>
          ),
        }}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.content}>
        {/* Animated/Glowing Logo Circle */}
        <View style={styles.logoCircle}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </View>

        {/* Dynamic Topic Passed from Support Screen */}
        <Text style={styles.topicText}>{topic || 'General enquiries'}</Text>
        
        {/* Contact info exactly like reference */}
        <Text style={styles.phoneNumber}>0860 102 043</Text>
        <Text style={styles.agentText}>You're speaking to a Client Care agent.</Text>

        {/* Timer */}
        <Text style={styles.timerText}>{formatTime(callDuration)}</Text>

        {/* Circular Action Buttons */}
        <View style={styles.controlsRow}>
          <View style={styles.controlWrapper}>
            <TouchableOpacity
              style={[styles.smallBtn, isSpeaker && styles.smallBtnActive]}
              onPress={() => setIsSpeaker(!isSpeaker)}
              activeOpacity={0.8}
            >
              <Icon
                name="volume-2"
                type="Feather"
                size={22}
                color={isSpeaker ? '#fff' : '#00A3E0'}
              />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Speaker</Text>
          </View>

          <View style={styles.controlWrapper}>
            <TouchableOpacity
              style={[styles.smallBtn, isMuted && styles.smallBtnActive]}
              onPress={() => setIsMuted(!isMuted)}
              activeOpacity={0.8}
            >
              <Icon
                name={isMuted ? 'mic-off' : 'mic-off'} // Both standard and active states use the slashed mic in this design style
                type="Feather"
                size={22}
                color={isMuted ? '#fff' : '#00A3E0'}
              />
            </TouchableOpacity>
            <Text style={styles.controlLabel}>Mute</Text>
          </View>
        </View>

        {/* End Call Button */}
        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall} activeOpacity={0.8}>
          <Icon name="phone-off" type="Feather" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Floating Status Notification Toast */}
      {toastVisible && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>Call Started</Text>
          <TouchableOpacity style={styles.toastBtn} onPress={() => setToastVisible(false)}>
            <Text style={styles.toastBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3.5,
    borderColor: '#00A3E0', // Capitec bright blue outline
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoIcon: {
    width: 48,
    height: 48,
  },
  topicText: {
    fontFamily: Fonts.fontBold,
    fontSize: 24,
    color: '#344555', // Dark slate blue matching the Capitec headers
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneNumber: {
    fontFamily: Fonts.fontRegular,
    fontSize: 16,
    color: '#4A5E6D', // Slightly darker slate
    marginBottom: 16,
  },
  agentText: {
    fontFamily: Fonts.fontMedium,
    fontSize: 16,
    color: '#4A5E6D',
    marginBottom: 40,
  },
  timerText: {
    fontFamily: Fonts.fontBold,
    fontSize: 18,
    color: '#344555',
    marginBottom: 60,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 45,
    marginBottom: 45,
  },
  controlWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  smallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff', // White circle background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  smallBtnActive: {
    backgroundColor: '#00A3E0', // Fills bright blue when active
  },
  controlLabel: {
    fontFamily: Fonts.fontRegular,
    fontSize: 15,
    color: '#344555',
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E21A2C', // Standard hang up red
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E21A2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30, // Hovering securely above the bottom safe area/tabs
    left: 20,
    right: 20,
    backgroundColor: '#79A736', // Capitec "Available" green
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    fontFamily: Fonts.fontMedium,
    color: '#fff',
    fontSize: 15,
  },
  toastBtn: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toastBtnText: {
    fontFamily: Fonts.fontBold,
    color: '#fff',
    fontSize: 14,
  },
});
