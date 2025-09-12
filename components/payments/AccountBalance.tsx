import { currencyFormatter } from "@/app/(tabs)"
import { colors } from "@/constants/Colors"
import { Fonts } from "@/constants/Fonts"
import { useAuth } from "@/hooks/useAuth"
import { Image, StyleSheet, Text, View } from "react-native"
import Icon from "../ui/Icon"

export const AccountBalance = () => {
    const {accountInfo} = useAuth();
    return(
        <View>
            <Text style={styles.sectionTitle}>From</Text>
            <View style={styles.card}>
              <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14}}>
                <View style={styles.fromLeft}>
                  <View style={styles.fromIconBox}>
                    <Image source={require('../../assets/images/transact.png')} style={{ width: 36, height: 36, tintColor: colors.primary }} resizeMode="contain" />
                  </View>
                  <View style={{  }}>
                    <Text style={styles.fromTitle}>Main Account</Text>
                    <Text style={styles.fromSubtitle}>Available balance</Text>
                  </View>
                </View>
                <View style={styles.fromRight}>
                  <Text style={styles.balance}>{currencyFormatter(accountInfo?.balance || 0)}</Text>
                  <Icon name="more-vertical" type="Feather" size={20} color={colors.primary} />
                </View>
              </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.faintGray },
    sectionTitle: { fontSize: 14, color: '#333', paddingHorizontal: 16, paddingVertical: 12, fontFamily: Fonts.fontBold },
    card: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1.5 },
    fromRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lightGray },
    fromLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    fromIconBox: { alignItems: 'center', justifyContent: 'center'},
    fromTitle: { fontFamily: Fonts.fontBold, color: '#111' },
    fromSubtitle: { fontFamily: Fonts.fontLight, color: colors.gray, marginTop: 2, fontSize: 12 },
    fromRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    balance: { fontFamily: Fonts.fontBold, color: '#111' },
})