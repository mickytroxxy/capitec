import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AccountCard from '@/components/AccountCard';
import AddCard from '@/components/AddCard';
import Icon from '@/components/ui/Icon';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import {
  ChevronRight
} from 'lucide-react-native';

export const currencyFormatter = (amount: any) => {
  const formattedAmount = parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R${formattedAmount}`;
};
export default function HomeScreen() {
  const { accountInfo } = useAuth();
  const router  = useRouter();
  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#f5f5f5'}} edges={['left','right']}>
      <ScrollView style={{flex:1,margin:-10}} showsVerticalScrollIndicator={false}>
        {/* My Dashboard Section */}
        <View style={[styles.section,{marginTop:26}]}>
          <View style={styles.sectionHeader}>
            <View style={{justifyContent:'center'}}><Text style={[styles.sectionTitle,{marginBottom:0}]}>My dashboard</Text></View>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}}>
              <Text style={styles.editText}>Edit</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Main Account Card */}
          <AccountCard
            type="main"
            title="Main Account"
            subtitle="Available balance"
            amount={currencyFormatter(accountInfo?.balance || 0)}
            onPress={() => router.push('/main-account')}
          />

          {/* Insure Card */}
          <AccountCard
            type="insure"
            title="Insure"
            subtitle="Cover for you and your family"
            onClose={() => {}}
          />

          {/* Add Button */}
          <AddCard onPress={() => {}} />
        </View>

        {/* Live Better Section */}
        <View style={[styles.section,{marginTop:0}]}>
          <Text style={styles.sectionTitle}>Live Better</Text>

          <AccountCard
            type="live"
            title="Live Better"
            subtitle="Get cash back and discounts"
          />

          <AccountCard
            type="connect"
            title="Capitec Connect"
            subtitle="Connecting you for less"
            onClose={() => {}}
          />
        </View>

        {/* Favourites Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favourites</Text>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}}>
              <Text style={styles.editText}>Edit</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.favouritesGrid}>
            <TouchableOpacity style={styles.favouriteCard}>
              <View style={styles.favouriteIcon}>
                <Icon name="smartphone" type="Feather" size={24} color={colors.primary} />
              </View>
              <Text style={styles.favouriteText}>Buy airtime and data</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.favouriteCard}>
              <View style={styles.favouriteIcon}>
                <Icon name='bulb-outline' type='Ionicons' size={24} color={colors.primary} />
              </View>
              <Text style={styles.favouriteText}>Buy electricity</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.favouriteCard}>
              <View style={styles.favouriteIcon}>
                <Icon name="arrow-swap" type="Fontisto" size={24} color={colors.primary} />
              </View>
              <Text style={styles.favouriteText}>Transfer money</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.favouriteCard}>
              <View style={styles.favouriteIcon}>
                <Icon name='qrcode' type='FontAwesome' size={24} color={colors.primary} />
              </View>
              <Text style={styles.favouriteText}>Scan to pay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Header styles removed because we use the Stack header now
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.fontMedium,
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: Fonts.fontMedium,
  },
  // Account Cards - now using AccountCard component
  // Add Card - now using AddCard component
  // Live Better and Connect Cards - now using AccountCard component
  // Favourites Section
  favouritesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop:-15,
    flexWrap:'wrap',
    gap:10,
    paddingBottom:30
  },
  favouriteCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  favouriteIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    //backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  favouriteText: {
    fontSize: 14,
    fontFamily: Fonts.fontRegular,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Legacy styles (keeping for compatibility)
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Fonts.fontBold,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: Fonts.fontBold,
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: Fonts.fontBold,
  },
});