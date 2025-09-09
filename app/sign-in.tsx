import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const {width} = Dimensions.get('screen')
export default function SignInScreen() {
  const {accountInfo} = useAuth();
  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.topToggle}>
            <Text style={styles.toggleText}>For me</Text>
          </View>
          <View style={{position:'absolute',alignSelf:'center',marginTop:16,zIndex:11,right:10}}>
            <TouchableOpacity><Icon name='more-vertical' type="Feather" size={30} color={colors.primary} /></TouchableOpacity>
          </View>
          <View style={{width:width,backgroundColor:'orange'}}>
            <Image source={require('../assets/images/signinimage.png')} style={styles.hero} resizeMode="cover" />
          </View>
          <View style={{position:'absolute',alignSelf:'center',bottom:48}}>
            <Text style={{ fontFamily: Fonts.fontRegular, fontSize: 16, color: colors.black}}>{accountInfo?.firstName?.toUpperCase()}</Text>
            <View style={{flexDirection:'row',gap:4,alignItems:'center',alignContent:'center',justifyContent:'center'}}>
              <Icon type='FontAwesome' name='circle' color={colors.primary} size={16} />
              <Icon type='FontAwesome' name='circle-o' color={colors.gray} size={16} />
            </View>
          </View>
        </View>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.tile}>
            <Icon name="smartphone" type="Feather" size={24} color={colors.primary} />
            <Text style={styles.tileLabel}>Buy airtime and data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile}>
            <Icon name="zap" type="Feather" size={24} color={colors.primary} />
            <Text style={styles.tileLabel}>Buy electricity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile}>
            <Icon name="compare-arrows" type="MaterialIcons" size={24} color={colors.primary} />
            <Text style={styles.tileLabel}>Transfer money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile}>
            <Icon name="qr-code" type="MaterialIcons" size={24} color={colors.primary} />
            <Text style={styles.tileLabel}>Pay me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile}>
            <Icon name="file-text" type="Feather" size={24} color={colors.primary} />
            <Text style={styles.tileLabel}>Pay bills</Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: '100%', paddingHorizontal: 16, marginTop: 10 }}>
          <LinearButton title="Sign In" onPress={() => router.push({pathname:'/enter-pin',params:{action:'old'}})} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf8f8ff' },
  content: { paddingBottom: 24, alignItems: 'center' },
  topToggle: { marginTop: 16, backgroundColor: colors.primary, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6, position:'absolute',alignSelf:'center',zIndex:10 },
  toggleText: { color: colors.white, fontFamily: Fonts.fontBold },
  hero: { width: width, height: 320},
  pill: { backgroundColor: '#e6f4fd', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6 },
  pillText: { color: colors.primary, fontFamily: Fonts.fontBold },
  name: { color: '#333', marginTop: 8, fontFamily: Fonts.fontBold, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16,marginTop:-35 },
  tile: { 
    width: '48%', 
    backgroundColor: '#fff', 
    padding: 16, borderRadius: 3, alignItems: 'center', gap: 10 ,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    shadowColor: '#000',
  },
  tileLabel: { fontFamily: Fonts.fontLight, color: '#111', textAlign: 'center' },
});

