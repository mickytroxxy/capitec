import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import YesNoSwitch from '@/components/ui/YesNoSwitch';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { loginApi } from '@/firebase';
import { setActiveUser } from '@/state/slices/accountInfo';
import { RootState } from '@/state/store';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function EnterPinScreen() {
  const [pin, setPin] = useState('');
  const [biometrics, setBiometrics] = useState(false);
  const dispatch = useDispatch();
  const { accountInfo } = useSelector((s: RootState) => s.accountInfo);

  const submit = async () => {
    const accountNumber = accountInfo?.accountNumber || '';
    const users = await loginApi(accountNumber, pin);
    if (users.length > 0) {
      dispatch(setActiveUser(users[0] as any));
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f9fcff'}}>
      <Stack.Screen options={{ 
        headerTitle: () => <View style={{backgroundColor:colors.primary,paddingHorizontal:16,paddingVertical:6,borderRadius:15}}><Text style={{color:colors.white,fontFamily:Fonts.fontMedium}}>For me</Text></View>, 
        headerLeft:() => <TouchableOpacity onPress={() => router.back()}><Icon name="arrow-left" type="Feather" size={24} color={colors.primary} /></TouchableOpacity>,
        headerStyle: { backgroundColor: '#f7f9fcff' },
        headerShadowVisible: false,
      }} />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{alignItems:'center'}}>
          <Image source={require('../assets/images/gone.jpeg')} style={{ width: '80%', height: 62 }} resizeMode="cover" />
        </View>
        <View style={{marginTop:30,flexDirection:'row'}}>
          <View style={{flex:1}}><Text style={styles.label}>Enter app PIN</Text></View>
          <View><Text style={[styles.label,{color:colors.primary}]}>Forgot PIN</Text></View>
        </View>
        
        <View style={{marginTop:10}}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#b9b7b7ff',
              borderRadius: 3,
              padding: 12,
              paddingVertical:15,
              fontSize: 14,
              color: '#111',
              fontFamily: Fonts.fontMedium,
              marginBottom: 10,
              backgroundColor:'#fff'
            }}
            value={pin}
            onChangeText={setPin}
            placeholder=""
            placeholderTextColor={colors.gray}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Biometrics</Text>
            <Text style={styles.cardSub}>Sign in and authenticate with fingerprint or facial recognition</Text>
            <Text style={styles.link}>Don&apos;t show me this again</Text>
          </View>
          <View>
            <YesNoSwitch value={biometrics} onChange={setBiometrics} />
          </View>
        </View>
        <View style={{marginTop:15}}>
          <LinearButton title="Submit" onPress={submit} />
        </View>
      </ScrollView>
      <View style={{alignItems:'center',padding:15}}><Text style={{textAlign:'center',fontFamily:Fonts.fontRegular,fontSize:8}}>Capitec Bank is an authorised financial services provider (FSP 46669) and registered credit provider (NCRCP13). Capitec Bank Limited Reg. No: 1980/003695/06</Text></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: Fonts.fontMedium, color: '#111', marginBottom: 6 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#b9b7b7ff', marginVertical: 14 },
  cardTitle: { fontFamily: Fonts.fontBold, color: '#111' },
  cardSub: { fontFamily: Fonts.fontLight, color: '#333', marginTop: 6 },
  link: { color: colors.primary, marginTop: 10, fontFamily: Fonts.fontBold },
});

