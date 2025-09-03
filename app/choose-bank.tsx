import { getBanks } from '@/api';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { setField } from '@/state/slices/beneficiaryFormSlice';
import { Stack, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function ChooseBankScreen() {
  const dispatch = useDispatch();
  const { popular, all } = getBanks();
  const [query, setQuery] = useState('');

  const filteredPopular = useMemo(
    () =>
      popular.filter((b) => {
        const q = query.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.branch.toLowerCase().includes(q);
      }),
    [popular, query]
  );
  const filteredAll = useMemo(
    () =>
      all.filter((b) => {
        const q = query.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.branch.toLowerCase().includes(q);
      }),
    [all, query]
  );

  const choose = (b: { name: string; branch: string }) => {
    dispatch(setField({ key: 'bank', value: b.name }));
    dispatch(setField({ key: 'branch', value: b.branch }));
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['left','right']}>
      <Stack.Screen options={{ title: 'Choose Bank', presentation: 'modal' as any }} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>Popular</Text>
        <View style={styles.list}>
          {filteredPopular.map((b, idx) => (
            <TouchableOpacity key={b.name} style={[styles.row, idx < filteredPopular.length - 1 && styles.rowDivider]} onPress={() => choose(b)}>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>{b.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionHeader, { marginTop: 10 }]}>All</Text>
        <View style={styles.list}>
          {filteredAll.map((b, idx) => (
            <TouchableOpacity key={b.name} style={[styles.row, idx < filteredAll.length - 1 && styles.rowDivider]} onPress={() => choose(b)}>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>{b.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  scroll: { flex: 1 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 10, color: '#111', fontFamily: Fonts.fontBold },
  list: { backgroundColor: colors.white },
  row: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.white },
  rowContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowDivider: { borderBottomWidth: 0.7, borderBottomColor: colors.borderColor },
  rowText: { fontSize: 14, color: '#111', fontFamily: Fonts.fontRegular },
  branchText: { fontSize: 13, color: '#666', fontFamily: Fonts.fontRegular },
});

