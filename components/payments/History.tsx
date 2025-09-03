import { currencyFormatter } from "@/app/(tabs)";

import Icon from "@/components/ui/Icon";
import { colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { getPaymentHistoryByBeneficiary } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { setPayments } from "@/state/slices/payments";
import { RootState } from "@/state/store";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export const History = ({ accountNo }: { accountNo: string }) => {
  const { accountInfo } = useAuth();
  const { payments } = useSelector((s: RootState) => s.payments);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const response = await getPaymentHistoryByBeneficiary(`${accountInfo?.accountNumber}_${accountNo}`);
      if (response?.length > 0) {
        dispatch(setPayments(response));
      } else {
        dispatch(setPayments([]));
      }
    })();
  }, [accountInfo?.accountNumber, accountNo, dispatch]);

  const total = useMemo(() => payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0), [payments]);

  // Group payments by Month YYYY
  const groups = useMemo(() => {
    const byMonth: Record<string, any[]> = {};
    const sorted = [...payments].sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    for (const p of sorted) {
      const d = new Date(p.transactionDate);
      const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      if (!byMonth[label]) byMonth[label] = [];
      byMonth[label].push(p);
    }
    // Preserve chronological order of groups based on first item in each group
    return Object.entries(byMonth).map(([label, items]) => ({ label, items }));
  }, [payments]);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} ${time}`;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Total card */}
      <View style={[styles.card, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{currencyFormatter(total)}</Text>
      </View>

      {/* Groups by month */}
      {groups.map((group) => (
        <View key={group.label} style={{ marginTop: 12 }}>
          <Text style={styles.groupHeader}>{group.label}</Text>

          <View style={[styles.card]}>
            {group.items.map((p, idx) => {
              const isLast = idx === group.items.length - 1;
              return (
                <TouchableOpacity
                  key={p.id || idx}
                  activeOpacity={0.7}
                  style={[styles.itemRow, !isLast && styles.itemDivider]}
                  onPress={() => router.push({ pathname: '/payment-details', params: { paymentId: p.id } })}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{p.beneficiaryName}</Text>
                    <Text style={styles.itemSub}>{formatDateTime(p.transactionDate)}</Text>
                  </View>

                  <View style={styles.rightWrap}>
                    <Text style={styles.amount}>{currencyFormatter(p.amount)}</Text>
                    <Icon name="chevron-right" type="Feather" size={18} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* Footer note */}
      <View style={styles.footerNoteWrap}>
        <Text style={styles.footerNote}>Payment history for the last 36 months.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
  },
  totalRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: { flex: 1, fontFamily: Fonts.fontMedium, color: '#111' },
  totalValue: { fontFamily: Fonts.fontRegular, color: colors.gray },

  groupHeader: {
    color: colors.black,
    fontFamily: Fonts.fontMedium,
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },

  itemRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderColor,
  },
  itemTitle: { color: '#111', fontFamily: Fonts.fontRegular, marginBottom: 2 },
  itemSub: { color: colors.gray, fontFamily: Fonts.fontRegular, fontSize: 12 },
  rightWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amount: { color: '#111', fontFamily: Fonts.fontRegular },

  footerNoteWrap: { paddingVertical: 18, alignItems: 'center' },
  footerNote: { color: colors.gray, fontFamily: Fonts.fontRegular, fontSize: 12 },
});