import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Stack, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const options = [
  { id: 'cellphone', title: 'Capitec cellphone', subtitle: "Pay to Capitec client's cellphone number" },
  { id: 'registered', title: 'Capitec registered', subtitle: 'DStv, Telkom, Mr Price, credit card, etc.' },
  { id: 'bank', title: 'Bank account', subtitle: "Enter beneficiary's bank details" },
];

export default function AddBeneficiaryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Add Beneficiary' }} />
      <View style={styles.list}>
          {options.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, idx < options.length - 1 && styles.rowDivider]}
              activeOpacity={0.7}
              onPress={() => {
                if (item.id === 'bank') {
                  router.push('/add-account');
                }
              }}
            >
              <View style={styles.texts}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" type="Feather" size={20} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: '#f5f6f8',
    marginTop:0,
    
  },
  scroll: { backgroundColor: '#f5f6f8',paddingBottom:10},
  list: { 
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
    overflow: 'hidden',
   },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff' },
  rowDivider: { borderBottomWidth: 0.6, borderBottomColor: colors.borderColor },
  texts: { flex: 1, paddingRight: 8 },
  title: { fontSize: 14, fontFamily: Fonts.fontRegular, color:colors.gray },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2, fontFamily: Fonts.fontLight },
});