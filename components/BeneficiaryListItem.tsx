import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Beneficiary } from '@/data/dummyData';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BeneficiaryListItemProps {
  beneficiary: Beneficiary;
  onPress: () => void;
}

export default function BeneficiaryListItem({ beneficiary, onPress }: BeneficiaryListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{beneficiary.avatar}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{beneficiary.name}</Text>
          <Text style={styles.bank}>
            Last paid: {beneficiary.lastPaid}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingHorizontal:8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: '#0d466cff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.fontMedium,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: Fonts.fontRegular,
    color: colors.black,
  },
  bank: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: Fonts.fontRegular,
  },
});