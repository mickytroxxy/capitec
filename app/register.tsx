import Dropdown, { DropdownOption } from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createData } from '@/firebase';
import { phoneNoValidation } from '@/hooks/useProof';
import { setAccountInfo } from '@/state/slices/accountInfo';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const titles: DropdownOption<'Mr' | 'Miss'>[] = [
  { label: 'Mr', value: 'Mr' },
  { label: 'Miss', value: 'Miss' },
];

export default function RegisterScreen() {
  const dispatch = useDispatch();
  const [title, setTitle] = useState<'Mr' | 'Miss' | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const canSubmit = !!title && firstName && lastName && phone && pin.length === 6;
  const router = useRouter();

  const onRegister = async () => {
    if (!canSubmit || !title) return;
    const accountNumber = Math.floor(Math.random() * 1000000000).toString();
    const payload = {
      id: Date.now(),
      title,
      firstName,
      lastName,
      phone:phoneNoValidation(phone,'+27'),
      accountNumber,
      pin,
      balance: 0,
      active: true,
      notificationToken: '',
    };
    setLoading(true);
    const ok = await createData('users', String(payload.id), payload);
    dispatch(setAccountInfo(payload as any));
    setLoading(false);
    if (ok) {
      setTimeout(() => {
        router.push('/sign-in');
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Register' }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <Image source={require('../assets/images/gone.jpeg')} style={{ width: '80%', height: 62 }} resizeMode="cover" />
        </View>

        <View style={styles.card}>
          <Dropdown label="Title" value={title} options={titles} onChange={setTitle as any} />
          <View style={{ height: 12 }} />
          <TextField label="First name" value={firstName} onChangeText={setFirstName} />
          <View style={{height:0.7,backgroundColor:colors.borderColor}}/>
          <View style={{ height: 10 }} />
          <TextField label="Last name" value={lastName} onChangeText={setLastName} />
          <View style={{height:0.7,backgroundColor:colors.borderColor}}/>
          <View style={{ height: 10 }} />
          <View style={{ height: 10 }} />
          <TextField label="Phone" maxLength={10} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <View style={{height:0.7,backgroundColor:colors.borderColor}}/>
          <View style={{ height: 10 }} />
          <View style={{flexDirection:'row'}}>
            <View style={{flex:1}}>
              <TextField maxLength={6} label="Remote PIN" value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry={secureTextEntry} />
            </View>
            <View style={{justifyContent:'center'}}><TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}><Icon name={secureTextEntry ? 'eye' : 'eye-off'} type="Feather" size={20} color={colors.primary} /></TouchableOpacity></View>
          </View>
        </View>

        <View style={{ height: 16 }} />
        <LinearButton title={loading ? 'Creating...' : 'Create profile'} onPress={onRegister} disabled={!canSubmit || loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fcff' },
  logoWrap: { alignItems: 'center', marginTop: 6, marginBottom: 16 },
  card: { backgroundColor: colors.white, borderRadius: 10, padding: 12, gap: 2,elevation:2,shadowColor: '#000',shadowOpacity: 0.08,shadowRadius: 6,shadowOffset: { width: 0, height: 3 }, },
  title: { fontFamily: Fonts.fontBold, fontSize: 16, color: '#111' },
});

