import Icon from '@/components/ui/Icon';
import YesNoSwitch from '@/components/ui/YesNoSwitch';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { setActiveTab, setToggle } from '@/state/slices/accounts';
import { RootState } from '@/state/store';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function AccountsScreen() {
  const { accountInfo } = useAuth();
  const dispatch = useDispatch();
  const { activeTab, onlinePurchases, internationalTransactions, tapToPay } = useSelector((s: RootState) => s.accounts);

  const name = `${accountInfo?.firstName || ''} ${accountInfo?.lastName || ''}`.trim().toUpperCase();
  const account = accountInfo?.accountNumber || '';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerTitle:'',
        headerLeft:() =>
        <TouchableOpacity onPress={() => dispatch(setActiveTab('cards'))} style={{borderBottomWidth:activeTab === 'cards' ? 3 : 0,borderBottomColor:colors.white,flex:1,alignItems:'center',paddingVertical:15}}>
          <Text style={[styles.tabText, activeTab === 'cards' && styles.tabTextActive]}>Cards</Text>
        </TouchableOpacity>,
        headerRight:() =>
        <TouchableOpacity onPress={() => dispatch(setActiveTab('virtual'))} style={{borderBottomWidth:activeTab === 'virtual' ? 3 : 0,borderBottomColor:colors.white,flex:1,alignItems:'center',paddingVertical:15}}>
          <Text style={[styles.tabText, activeTab === 'virtual' && styles.tabTextActive]}>Virtual Cards</Text>
        </TouchableOpacity>
       }} />

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'cards' ? (
          <>
            {/* Card visual */}
            <View style={styles.cardContainer}>
              <Image source={require('../../assets/images/card.png')} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardName}>{name || 'CARD HOLDER'}</Text>
                <Text style={styles.cardAccount}>{account || '0000000000'}</Text>
              </View>
            </View>

            {/* Show card details */}
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <TouchableOpacity style={{alignItems:'center'}}>
                <Text style={{ color: colors.primary, fontFamily: Fonts.fontMedium }}>Show Card Details</Text>
              </TouchableOpacity>
            </View>

            {/* Toggles list */}
            <View style={styles.listBlock}>
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Online purchases</Text>
                  <Text style={styles.rowSubtitle}>Use your card to shop online</Text>
                </View>
                <YesNoSwitch value={onlinePurchases} onChange={(v) => dispatch(setToggle({ key: 'onlinePurchases', value: v }))} />
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>International transactions</Text>
                  <Text style={styles.rowSubtitle}>Use your card to make international transactions</Text>
                </View>
                <YesNoSwitch value={internationalTransactions} onChange={(v) => dispatch(setToggle({ key: 'internationalTransactions', value: v }))} />
              </View>
              <View style={styles.separator} />
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>Learn more about card toggles</Text>
                </View>
                <Icon name="info" type="Feather" size={24} color={colors.primary} />
              </View>
            </View>

            <View style={styles.listBlock}>
              {/* Tap to pay */}
              <TouchableOpacity style={[styles.row, styles.tapRow]} activeOpacity={0.7} onPress={() => dispatch(setToggle({ key: 'tapToPay', value: !tapToPay }))}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon name="rss" type="Feather" size={18} color={colors.primary} />
                  <Text style={styles.rowTitle}>Tap to pay</Text>
                </View>
                <Icon name="chevron-right" type="Feather" size={22} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.separator} />
              {/* Stop card */}
              <TouchableOpacity style={[styles.row, styles.tapRow]} activeOpacity={0.7} onPress={() => {}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Icon name="pause-circle" type="Feather" size={18} color={colors.primary} />
                  <Text style={styles.rowTitle}>Stop card</Text>
                </View>
                <Icon name="chevron-right" type="Feather" size={22} color={colors.primary} />
              </TouchableOpacity>
              <View style={styles.separator} />
              {/* Update permanent limits */}
              <TouchableOpacity style={[styles.row, styles.tapRow]} activeOpacity={0.7} onPress={() => {}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {/* <Icon name="sliders" type="Feather" size={18} color={colors.primary} /> */}
                  <Text style={styles.rowTitle}>Update permanent limits</Text>
                </View>
                <Icon name="chevron-right" type="Feather" size={22} color={colors.primary} />
              </TouchableOpacity>

              {/* Set temporary limits */}
              <TouchableOpacity style={[styles.row, styles.tapRow]} activeOpacity={0.7} onPress={() => {}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {/* <Icon name="clock" type="Feather" size={18} color={colors.primary} /> */}
                  <Text style={styles.rowTitle}>Set temporary limits</Text>
                </View>
                <Icon name="chevron-right" type="Feather" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

          </>
        ) : (
          <View style={{ padding: 16 }}>
            <Text style={{ textAlign: 'center', color: '#666', fontFamily: Fonts.fontLight }}>Virtual cards coming soon.</Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  scroll: { flex: 1 },
  headerBlue: { backgroundColor: colors.primary, paddingTop: 8, paddingBottom: 4 },
  tabsRow: { flexDirection: 'row', alignSelf: 'stretch', paddingHorizontal: 12 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 8, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#fff' },
  tabText: { color: '#e0f1ff', fontFamily: Fonts.fontLight },
  tabTextActive: { color: '#fff', fontFamily: Fonts.fontBold },

  cardContainer: { alignSelf: 'center', width: '60%',height:350, marginTop: 14, borderRadius: 16 },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', left: 32, right: 20, bottom: '36%' },
  activePill: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#67b309', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, zIndex: 2 },
  activePillText: { color: '#fff', fontFamily: Fonts.fontBold, fontSize: 12 },
  cardName: { color: '#d4cacaff', fontFamily: Fonts.fontMedium, fontSize: 14 },
  cardAccount: { color: '#d4cacaff', fontFamily: Fonts.fontMedium, fontSize: 13, letterSpacing: 1 },
  cardCaption: { color: '#f2f2f2', fontFamily: Fonts.fontLight, fontSize: 10, marginTop: 2 },

  listBlock: { backgroundColor: '#fff', marginTop: 16, shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
    overflow: 'hidden', },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowInfo: { flex: 1, paddingRight: 12 },
  rowTitle: { color: '#111', fontFamily: Fonts.fontRegular,fontSize:16 },
  rowSubtitle: { color: '#666', fontFamily: Fonts.fontLight, marginTop: 4 },
  separator: { height: 1, backgroundColor: '#eee', marginLeft: 16 },
  learnRow: { backgroundColor: '#fff', marginTop: 12 },
  learnText: { color: colors.primary, fontFamily: Fonts.fontBold },
  tapRow: { backgroundColor: '#fff' },
});