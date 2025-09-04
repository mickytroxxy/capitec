import ConfirmAddBeneficiaryModal from '@/components/ui/ConfirmAddBeneficiaryModal';
import LinearButton from '@/components/ui/LinearButton';
import TextField from '@/components/ui/TextField';
import YesNoSwitch from '@/components/ui/YesNoSwitch';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createData } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { setBeneficiaries } from '@/state/slices/beneficiaries';
import { setField } from '@/state/slices/beneficiaryFormSlice';
import { RootState } from '@/state/store';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function AddAccountScreen() {
  // Redux form state
  const dispatch = useDispatch();
  const form = useSelector((s: RootState) => s.beneficiaryForm);
  const {beneficiaries} = useSelector((s: RootState) => s.beneficiaries);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const params = useLocalSearchParams<{ bank?: string, notificationType?: string, notificationValue?: string }>();
  const {accountInfo} = useAuth();
  useEffect(() => {
    if (params?.bank && typeof params.bank === 'string') {
      dispatch(setField({ key: 'bank', value: params.bank }));
    }
    if (params?.notificationType && typeof params.notificationType === 'string') {
      const t = params.notificationType as 'none' | 'sms' | 'email';
      dispatch(setField({ key: 'notificationType', value: t }));
      if (params?.notificationValue && typeof params.notificationValue === 'string') {
        dispatch(setField({ key: 'notificationValue', value: params.notificationValue }));
      }
    }
  }, [params?.bank, params?.notificationType, params?.notificationValue]);

  const openConfirm = () => {
    setModal(true);
  };

  const onConfirm = async (pin: string) => {
    try {
      setSubmitting(true);
      const res = await createData('beneficiaries', form.account, {
        name: form.name,
        account: form.account,
        bank: form.bank,
        branch: form.branch,
        reference: form.reference,
        oneTime: form.oneTime,
        notificationType: form.notificationType,
        notificationValue: form.notificationValue,
        lastPaid: null,
        userId: accountInfo?.id || 1,
      });
      const newBeneficiary = {
        id: Date.now(),
        name: form.name,
        account: form.account,
        bank: form.bank,
        branch: form.branch,
        reference: form.reference,
        oneTime: form.oneTime,
        notificationType: form.notificationType,
        notificationValue: form.notificationValue,
        userId: accountInfo?.id,
        // Fields expected by TransformedBeneficiary
        avatar: '',
        accountNumber: form.account,
        lastPaid: '',
      } as any;
      dispatch(setBeneficiaries([newBeneficiary, ...beneficiaries] as any));
      setSubmitting(false);
      setModal(false);
      if (res) {
        router.replace({ pathname: '/beneficiary-added', params: { account: form.account, name: form.name } as any });
      }
    } catch (e) {
      setSubmitting(false);
      Alert.alert('Error', 'Could not add beneficiary');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left','right']}>
      <Stack.Screen options={{ title: 'Add Beneficiary' }} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Ensure you enter the correct details. Only Capitec account numbers are verified against the actual accountholder.
          </Text>
        </View>

        <View style={{gap:10}}>
          <View style={styles.card}>
            <TextField label="Beneficiary name" value={form.name} onChangeText={(v) => dispatch(setField({ key: 'name', value: v }))} placeholder="" />
          </View>

          <View style={styles.card}>
            <TextField label="Account number" value={form.account} onChangeText={(v) => dispatch(setField({ key: 'account', value: v }))} keyboardType="number-pad" />
            <View style={{height:0.7,backgroundColor:colors.borderColor}}/>
            <TextField label="Choose bank" isDropdown value={form.bank} onChangeText={() => {}} editable={false} rightChevron onPressRight={() => router.push('/choose-bank')} />
          </View>

          <View style={styles.card}>
            <TextField label="Branch code" value={form.branch} onChangeText={(v) => dispatch(setField({ key: 'branch', value: v }))} keyboardType="number-pad" />
          </View>

          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.sectionTitle}>One-time beneficiary</Text>
                <Text style={styles.sectionSub}>Used for once-off payment</Text>
              </View>

              <YesNoSwitch value={form.oneTime} onChange={(v) => dispatch(setField({ key: 'oneTime', value: v }))} />
            </View>
          </View>

          <View style={styles.card}>
            <TextField label="Beneficiary reference" value={form.reference} onChangeText={(v) => dispatch(setField({ key: 'reference', value: v }))} placeholder="" />
          </View>

            <Text style={[styles.sectionTitle, {paddingHorizontal:16}]}>Payment notification</Text>
            <View style={styles.card}>
              <TextField
                isDropdown
                label="Choose notification type"
                value={form.notificationType === 'none' ? 'None' : form.notificationType.toUpperCase()}
                onChangeText={() => {}}
                editable={false}
                rightChevron
                onPressRight={() => router.push('/payment-notification')}
              />
            </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearButton title={submitting ? 'Submitting...' : 'Add'} onPress={openConfirm} disabled={submitting} />
      </View>

      <ConfirmAddBeneficiaryModal
        visible={modal}
        onClose={() => setModal(false)}
        onConfirm={onConfirm}
        title={`You are about to add ${form.name || 'this person'} as a beneficiary`}
        bankName={form.bank || 'Selected Bank'}
        accountNumber={form.account || '____'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  scroll: { flex: 1 },
  infoBar: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 12 },
  infoText: { color: '#fff', fontSize: 12, textAlign: 'center', fontFamily: Fonts.fontRegular },
  card: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1.5 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  sectionTitle: { fontSize: 14, color: '#111', fontFamily: Fonts.fontBold },
  sectionSub: { fontSize: 12, color: colors.gray, fontFamily: Fonts.fontLight, marginTop: 4 },
  ref: { fontSize: 14, fontFamily: Fonts.fontBold, color: '#111', paddingHorizontal: 16, paddingBottom: 14 },
  none: { fontSize: 14, color: colors.gray, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 12, fontFamily: Fonts.fontLight },
  footer: { padding: 16},
  // Yes/No segmented control
  yesNoWrap: { flexDirection: 'row', backgroundColor: colors.faintGray, borderRadius: 20, padding: 4 },
  yesNoBtn: { minWidth: 64, paddingHorizontal: 14, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  yesNoActive: { backgroundColor: colors.primary },
  yesNoText: { fontSize: 12, color: '#37474F', fontFamily: Fonts.fontLight },
  yesNoTextActive: { color: '#fff', fontFamily: Fonts.fontBold },
});

