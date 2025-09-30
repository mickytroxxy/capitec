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


export default function SettingsScreen() {
  const dispatch = useDispatch();
    const settings = useSelector((state: RootState) => state.settings);
    const {capitecAllowed,immediateAllowed,capitecErrorMsg,immediateErrorMsg} = settings;
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

