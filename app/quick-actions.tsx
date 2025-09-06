import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import Icon from '@/components/ui/Icon';

export default function QuickActionsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.faintGray }}>
      <Stack.Screen options={{ title: '' }} />

      <View style={styles.header}>
        <View style={styles.pill}><Text style={styles.pillText}>For me</Text></View>
        <Image source={require('../assets/images/global.png')} style={{ width: 140, height: 50 }} resizeMode="contain" />
        <Text style={styles.name}>REBECCA</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.tile}>
          <Icon name="phone" type="Feather" size={24} color={colors.primary} />
          <Text style={styles.tileLabel}>Buy airtime and data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile}>
          <Icon name="zap" type="Feather" size={24} color={colors.primary} />
          <Text style={styles.tileLabel}>Buy electricity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile}>
          <Icon name="arrow-left-right" type="Feather" size={24} color={colors.primary} />
          <Text style={styles.tileLabel}>Transfer money</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile}>
          <Icon name="qr-code" type="MaterialIcons" size={24} color={colors.primary} />
          <Text style={styles.tileLabel}>Pay me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tile}>
          <Icon name="file-text" type="Feather" size={24} color={colors.primary} />
          <Text style={styles.tileLabel}>Pay bills</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 10, paddingBottom: 16, backgroundColor: '#fff' },
  pill: { backgroundColor: '#e6f4fd', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6 },
  pillText: { color: colors.primary, fontFamily: Fonts.fontBold },
  name: { color: '#333', marginTop: 8, fontFamily: Fonts.fontBold, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  tile: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 10, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E5E5E5' },
  tileLabel: { fontFamily: Fonts.fontLight, color: '#111', textAlign: 'center' },
});

