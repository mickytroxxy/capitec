import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getPaymentsForAccount } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { setPayments } from '@/state/slices/payments';
import { RootState } from '@/state/store';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { currencyFormatter } from './(tabs)';

export default function MainAccountScreen() {
  const { accountInfo } = useAuth();
  const { payments } = useSelector((s: RootState) => s.payments);
  const dispatch = useDispatch();
  const [tab, setTab] = useState<'all' | 'in' | 'out' | 'track'>('all');

  useEffect(() => {
    (async () => {
      if (!accountInfo?.accountNumber) return;
      const resp = await getPaymentsForAccount(accountInfo.accountNumber);
      dispatch(setPayments(resp || []));
    })();
  }, [accountInfo?.accountNumber, dispatch]);

  const filtered = useMemo(() => {
    if (tab === 'all') return payments;
    if (tab === 'in') return payments.filter(p => (p.beneficiaryAccount === accountInfo?.accountNumber));
    if (tab === 'out') return payments.filter(p => (p.senderAccount === accountInfo?.accountNumber));
    return payments;
  }, [payments, tab, accountInfo?.accountNumber]);

  const groups = useMemo(() => {
    const byMonth: Record<string, any[]> = {};
    const sorted = [...filtered].sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    for (const p of sorted) {
      const d = new Date(p.transactionDate);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(p);
    }
    return Object.entries(byMonth).map(([label, items]) => ({ label, items })).sort((a, b) => new Date(b.label + ' 1').getTime() - new Date(a.label + ' 1').getTime());
  }, [filtered]);

  const currency = (a: any) => {
    const formatted = parseFloat(String(a || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `R${formatted}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Blue header card */}
        <View style={styles.headerBlue}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12,paddingVertical:5,paddingHorizontal:10,backgroundColor:'rgba(0,0,0,0.2)',marginHorizontal:16,borderRadius:10 }}>
            <View style={{width:22}}></View>
            <View style={{flex:1,alignItems:'center'}}>
              <Text style={styles.available}>Available</Text>
              <Text style={styles.availableAmount}>{currencyFormatter(accountInfo?.balance || 0)}</Text>
            </View>
            <View style={{}}>
              <Icon name="info" type="Feather" size={22} color={'#eaf6ff'} />
            </View>
          </View>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>{currency(accountInfo?.balance || 0)}</Text>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {([
              { key: 'all', label: 'All' },
              { key: 'in', label: 'Money In' },
              { key: 'out', label: 'Money Out' },
              { key: 'track', label: 'Track' },
            ] as const).map(t => (
              <TouchableOpacity key={t.key} onPress={() => setTab(t.key as any)} style={[styles.tab, tab === t.key && styles.tabActive]}>
                <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Edge-to-edge transaction list */}
        <View>
          {groups.map(g => (
            <View key={g.label}>
              <View style={styles.monthHeaderRow}>
                <Text style={styles.monthHeader}>{g.label}</Text>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:4}}>
                  <Text style={styles.statementLink}>Statement</Text>
                  <Icon name="chevron-right" type="Feather" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.listCard}>
                {g.items.map((p: any, idx: number) => {
                  const isLast = idx === g.items.length - 1;
                  const isCredit = p.beneficiaryAccount === accountInfo?.accountNumber && !p.statementDescription?.toLowerCase().includes('fee');
                  return (
                    <TouchableOpacity key={p.id || idx} activeOpacity={0.7} style={[styles.itemRow, !isLast && styles.itemDivider]} onPress={() => router.push({ pathname: '/payment-details', params: { paymentId: p.id } })}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle}>{p.statementDescription || p.beneficiaryName}</Text>
                        <Text style={styles.itemSub}>{new Date(p.transactionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {p.paymentType === 'immediate' ? 'Immediate' : 'Transfer'}</Text>
                      </View>
                      <Text style={[styles.amount, { color: isCredit ? '#2e7d32' : '#111' }]}>{isCredit ? currency(p.amount) : `-${currency(p.amount)}`}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  headerBlue: {
    backgroundColor: colors.primary,
    paddingTop: 18,
    paddingBottom: 5,
    alignItems: 'center',
  },
  available: { color: '#eaf6ff', fontFamily: Fonts.fontRegular },
  availableAmount: { color: '#fff', fontSize: 24, fontFamily: Fonts.fontMedium, marginTop: 2 },
  balanceLabel: { color: '#eaf6ff', fontFamily: Fonts.fontRegular, marginTop: 14 },
  balanceValue: { color: '#fff', fontFamily: Fonts.fontBold, marginTop: 4 },
  tabsRow: { flexDirection: 'row', marginTop: 18, alignSelf: 'stretch', paddingHorizontal: 12, gap: 8 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 8, borderBottomWidth: 4, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#fff' },
  tabText: { color: '#e0f1ff', fontFamily: Fonts.fontRegular },
  tabTextActive: { color: '#fff', fontFamily: Fonts.fontBold },

  monthHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14 },
  monthHeader: { color: '#111', fontFamily: Fonts.fontBold },
  statementLink: { color: colors.primary, fontFamily: Fonts.fontMedium },

  listCard: { backgroundColor: colors.white, marginTop: 8 },
  itemRow: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
  itemDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderColor },
  itemTitle: { color: '#111', fontFamily: Fonts.fontRegular },
  itemSub: { color: colors.gray, fontFamily: Fonts.fontRegular, fontSize: 12, marginTop: 2 },
  amount: { fontFamily: Fonts.fontRegular },
});

