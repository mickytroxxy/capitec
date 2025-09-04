import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Data model following the screenshot: 2 groups with optional isNew badges
export type TransactItem = {
  id: string;
  title: string;
  icon: { name: string; type: string };
  isNew?: boolean;
  onPress?: () => void;
};

const groups: { id: string; items: TransactItem[] }[] = [
  {
    id: 'group-1',
    items: [
      { id: 'pay-beneficiary', title: 'Pay beneficiary', icon: { name: 'users', type: 'Feather' }, onPress: () => router.push('/pay-beneficiary') },
      { id: 'payshap', title: 'PayShap', icon: { name: 'grid', type: 'Feather' }, onPress: () => router.push('/cash-send') },
      { id: 'pay-bills', title: 'Pay bills', icon: { name: 'file-text', type: 'Feather' } },
      { id: 'cross-border', title: 'Cross-border money transfers', icon: { name: 'send', type: 'Feather' }, isNew: true },
      { id: 'international', title: 'International payments', icon: { name: 'dollar-sign', type: 'Feather' } },
    ],
  },
  {
    id: 'group-2',
    items: [
      { id: 'airtime-data', title: 'Buy airtime and data', icon: { name: 'smartphone', type: 'Feather' } },
      { id: 'electricity-water', title: 'Buy electricity and water', icon: { name: 'zap', type: 'Feather' }, isNew: true },
      { id: 'lotto', title: 'Play LOTTO', icon: { name: 'gift', type: 'Feather' } },
      { id: 'vouchers', title: 'Buy vouchers', icon: { name: 'shopping-bag', type: 'Feather' }, isNew: true },
      { id: 'licence-disc', title: 'Renew licence disc', icon: { name: 'car', type: 'FontAwesome' }, isNew: true },
    ],
  },
];

export default function PaymentsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        {groups.map((group, gIdx) => (
          <View key={group.id} style={styles.groupContainer}>
            {group.items.map((item, idx) => {
              const isLast = idx === group.items.length - 1;
              return (
                <TouchableOpacity onPress={() => item?.onPress ? item.onPress() : router.push('/pay-beneficiary')} key={item.id} style={[styles.row, !isLast && styles.rowDivider]} activeOpacity={0.7}>
                  <View style={styles.left}>
                    <View style={styles.iconCircle}>
                      <Icon name={item.icon.name} type={item.icon.type} size={22} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>{item.title}</Text>
                  </View>

                  <View style={styles.right}>
                    {item.isNew && (
                      <View style={styles.badge}><Text style={styles.badgeText}>New</Text></View>
                    )}
                    <Icon name="chevron-right" type="Feather" size={20} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {gIdx < groups.length - 1 && <View style={styles.groupDivider} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { backgroundColor: '#fff',marginTop:10 },

  groupContainer: { backgroundColor: '#fff' },
  groupDivider: { height: 10, backgroundColor: '#f3f5f7' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: '#ffffff',
  },
  rowDivider: {
    borderBottomWidth: 0.8,
    borderBottomColor: colors.borderColor,
  },

  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: '#E6F4FF',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    color: '#37474F',
    fontFamily: Fonts.fontLight,
  },

  right: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    backgroundColor: '#B91024',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.fontBold,
  },
});