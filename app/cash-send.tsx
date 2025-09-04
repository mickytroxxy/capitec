import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CashSend() {
  const [tab, setTab] = useState<'global' | 'connect' | 'live'>('global');

  const Tile = ({ icon, title, subtitle, right }: { icon: any; title: string; subtitle: string; right?: any }) => (
    <TouchableOpacity style={styles.tile} activeOpacity={0.8}>
      <View style={styles.tileLeft}>
        <View style={styles.tileIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tileTitle}>{title}</Text>
          <Text style={styles.tileSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {right || <ChevronRight size={18} color="#666" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsBar}>
        <TouchableOpacity style={[styles.tab, tab === 'global' && styles.tabActive]} onPress={() => setTab('global')}>
          <Text style={[styles.tabText, tab === 'global' && styles.tabTextActive]}>GlobalOne</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'connect' && styles.tabActive]} onPress={() => setTab('connect')}>
          <Text style={[styles.tabText, tab === 'connect' && styles.tabTextActive]}>Capitec Connect <Text style={styles.badge}>New</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'live' && styles.tabActive]} onPress={() => setTab('live')}>
          <Text style={[styles.tabText, tab === 'live' && styles.tabTextActive]}>Live Better</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {tab === 'global' && (
          <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
            <Tile icon={<Icon name="trending-up" type="Feather" size={18} color="#fff" />} title="Main Account" subtitle="Day-to-day transactional account" />
            <Tile icon={<Icon name="bar-chart-2" type="Feather" size={18} color="#fff" />} title="Save" subtitle="Access, Notice, Fixed and Tax-free" right={<Text style={styles.newPill}>New</Text>} />
            <Tile icon={<Icon name="credit-card" type="Feather" size={18} color="#fff" />} title="Credit" subtitle="Credit Card, Facility & Loan" />
            <Tile icon={<Icon name="shield" type="Feather" size={18} color="#fff" />} title="Insure" subtitle="Cover for you and your family" />

            <Text style={styles.sectionHeader}>For your business</Text>
            <Tile icon={<Icon name="smartphone" type="Feather" size={18} color="#fff" />} title="Card Machines" subtitle="Lower fees, faster payments" right={<Text style={styles.newPill}>New</Text>} />
          </View>
        )}

        {tab === 'connect' && (
          <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
            <Tile icon={<Icon name="phone" type="Feather" size={18} color="#fff" />} title="Buy Airtime" subtitle="Best value with Capitec Connect" />
            <Tile icon={<Icon name="wifi" type="Feather" size={18} color="#fff" />} title="Buy Data" subtitle="Affordable data bundles" />
          </View>
        )}

        {tab === 'live' && (
          <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
            <Tile icon={<Icon name="gift" type="Feather" size={18} color="#fff" />} title="Live Better" subtitle="Get cash back and discounts" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  tabsBar: { backgroundColor: colors.secondary, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#fff' },
  tabText: { color: '#e0f1ff', fontFamily: Fonts.fontLight },
  tabTextActive: { color: '#fff', fontFamily: Fonts.fontBold },
  badge: { fontFamily: Fonts.fontBold },

  tile: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  tileIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { fontFamily: Fonts.fontBold, color: '#111' },
  tileSubtitle: { fontFamily: Fonts.fontLight, color: '#666', marginTop: 4 },
  sectionHeader: { fontFamily: Fonts.fontBold, color: '#666', paddingHorizontal: 4, marginTop: 12, marginBottom: 8 },
  newPill: { color: '#fff', backgroundColor: '#b5101b', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, overflow: 'hidden', fontFamily: Fonts.fontBold, fontSize: 12 },
});