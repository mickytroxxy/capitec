import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const txns = [
  'Capitec: Purchase -R43.00 from MAIN ACCOUNT; Ref CCN*Maa0 Supermarke2 Devland ZA; Avail R17.84; 30-Aug. Info: WhatsApp 067 418 9565',
  'Capitec: Purchase -R77.00 from MAIN ACCOUNT; Ref CCN*Maa0 Supermarke2 Devland ZA; Avail R29.78; 29-Aug. Info: WhatsApp 067 418 9565',
  'Capitec: Purchase -R118.00 from MAIN ACCOUNT; Ref CCN*Mandiweni Soweto ZA; Avail R130.78; 28-Aug. Info: WhatsApp 067 418 9565',
  'Capitec: Purchase -R86.00 from MAIN ACCOUNT; Ref 000 EMASOFENI 168003SOWETO GPZA; Avail R248.78; 28-Aug. Info: WhatsApp 067 418 9565',
  'Capitec: Purchase -R152.00 from MAIN ACCOUNT; Ref 000 EMASOFENI 168003SOWETO GPZA; Avail R304.78; 27-Aug. Info: WhatsApp 067 418 9565',
  'Capitec: Debit Order -R159.00 from MAIN ACCOUNT; Ref CARTRACK 2121827 250825SERVPROVDO2625871; Avail R522.84; 26-Aug.',
  'Capitec: Purchase -R110.00 from MAIN ACCOUNT; Ref CCN*Maa0 Supermarke2 Devland ZA; Avail R681.84; 25-Aug. Info: WhatsApp 067 418 9565',
  'Capitec: Payment -R30.00 from MAIN ACCOUNT; Ref CIPC; Avail R797.84; 25-Aug. Info: WhatsApp 067 418 9565',
];

export default function MessagesScreen() {
  const [tab, setTab] = useState<'transactions' | 'inbox'>('transactions');

  return (
    <SafeAreaView style={styles.container}>
      {/* Top tabs */}
      <View style={styles.tabsBar}>
        <TouchableOpacity style={[styles.tab, tab === 'transactions' && styles.tabActive]} onPress={() => setTab('transactions')}>
          <Text style={[styles.tabText, tab === 'transactions' && styles.tabTextActive]}>Transactions <Text style={styles.badge}>9</Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'inbox' && styles.tabActive]} onPress={() => setTab('inbox')}>
          <Text style={[styles.tabText, tab === 'inbox' && styles.tabTextActive]}>Inbox <Text style={styles.badge}>1</Text></Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Month header */}
        <Text style={styles.monthHeader}>Aug 2025</Text>

        {/* List */}
        {(tab === 'transactions' ? txns : []).map((t, idx) => (
          <TouchableOpacity key={idx} style={styles.itemRow} activeOpacity={0.8}>
            <Text numberOfLines={2} style={styles.itemText}>{t}</Text>
            <ChevronRight size={18} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    paddingBottom:5
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#fff' },
  tabText: { color: '#e0f1ff', fontFamily: Fonts.fontLight },
  tabTextActive: { color: '#fff', fontFamily: Fonts.fontBold },
  badge: { fontFamily: Fonts.fontBold },

  monthHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    color: '#666',
    fontFamily: Fonts.fontBold,
  },
  itemRow: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: { flex: 1, marginRight: 8, color: '#222', fontFamily: Fonts.fontLight },
});