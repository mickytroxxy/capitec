import TextField from '@/components/ui/TextField';
import YesNoSwitch from '@/components/ui/YesNoSwitch';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { setSettings } from '@/state/slices/settings';
import { RootState } from '@/state/store';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { updateTable } from '@/firebase';
import { setAccountInfo } from '@/state/slices/accountInfo';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const { capitecAllowed, immediateAllowed, capitecErrorMsg, immediateErrorMsg, useRealMoney, useRealMoneyErrorMsg } = settings;

  const { accountInfo } = useAuth();
  const [immediateAmount, setImmediateAmount] = React.useState(
    accountInfo?.immediateAmount?.toString() || ""
  );

  React.useEffect(() => {
    if (accountInfo?.immediateAmount) {
      setImmediateAmount(accountInfo.immediateAmount.toString());
    }
  }, [accountInfo?.immediateAmount]);

  return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Settings' }} />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
                <View style={styles.logoWrap}>
                <Image source={require('../assets/images/gone.jpeg')} style={{ width: '80%', height: 62 }} resizeMode="cover" />
                </View>

                <View style={styles.card}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}}>
                            <Text style={styles.title}>Allow Capitec</Text>
                        </View>
                        <View><YesNoSwitch value={capitecAllowed} onChange={() => dispatch(setSettings({...settings,capitecAllowed:!capitecAllowed}))}  /></View>
                    </View>
                    <View style={{ height: 12 }} />
                    <TextField label="Capitec Error Message" value={capitecErrorMsg} onChangeText={v => {
                        dispatch(setSettings({...settings,capitecErrorMsg:v}));
                        console.log(v)
                    }} />
                    <View style={{ height: 12 }} />
                </View>

                <View style={[styles.card,{marginTop:20}]}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}}>
                            <Text style={styles.title}>Allow Immediate</Text>
                        </View>
                        <View><YesNoSwitch value={immediateAllowed} onChange={() => dispatch(setSettings({...settings,immediateAllowed:!immediateAllowed}))}  /></View>
                    </View>
                    <View style={{ height: 12 }} />
                    <TextField label="Immediate Error Message" value={immediateErrorMsg} onChangeText={v => dispatch(setSettings({...settings,immediateErrorMsg:v}))} />
                    
                    {immediateAllowed && (
                      <>
                        <View style={{ height: 20 }} />
                        <View style={{ height: 1, backgroundColor: '#eee', marginBottom: 20 }} />
                        <View style={{flexDirection:'row'}}>
                            <View style={{flex:1, paddingRight: 12}}>
                                <Text style={styles.title}>Use real Money</Text>
                                <Text style={{ fontSize: 13, color: '#555', marginTop: 4, fontFamily: Fonts.fontRegular, lineHeight: 18 }}>
                                  You will have to send real money from a real account and make sure that the real account has the money to be sent as an Immediate payment.
                                </Text>
                            </View>
                            <View><YesNoSwitch value={useRealMoney} onChange={() => dispatch(setSettings({...settings,useRealMoney:!useRealMoney}))}  /></View>
                        </View>
                        
                        {useRealMoney && (
                          <View style={{ marginTop: 16 }}>
                            <TextField 
                              label="Immediate Payment Amount (R)" 
                              value={immediateAmount} 
                              onChangeText={setImmediateAmount} 
                              keyboardType="numeric"
                              onBlur={() => {
                                const num = parseFloat(immediateAmount) || 0;
                                dispatch(setAccountInfo({ ...accountInfo, immediateAmount: num } as any));
                                if (accountInfo?.id) {
                                  updateTable("users", accountInfo.id.toString(), { immediateAmount: num });
                                }
                              }}
                            />
                            <View style={{ height: 12 }} />
                            <TextField 
                              label="Use Real Money Error Msg" 
                              value={useRealMoneyErrorMsg} 
                              onChangeText={v => dispatch(setSettings({...settings, useRealMoneyErrorMsg: v}))} 
                            />
                          </View>
                        )}
                      </>
                    )}
                    
                    <View style={{ height: 12 }} />
                </View>
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

