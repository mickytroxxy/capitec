import { updateBeneficiaryNotification } from '@/api';
import { currencyFormatter } from '@/app/(tabs)';
import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useProof } from '@/hooks/useProof';
import { setBeneficiaries } from '@/state/slices/beneficiaries';
import { setField } from '@/state/slices/beneficiaryFormSlice';
import { showSuccess } from '@/state/slices/successSlice';
import { RootState } from '@/state/store';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const options = [
  { key: 'none', label: 'None' },
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
] as const;

type OptionKey = typeof options[number]['key'];

export default function PaymentNotificationScreen() {
  const params = useLocalSearchParams<{ account?: string, paymentId?: string }>();
  const dispatch = useDispatch();
  const { beneficiaries } = useSelector((s: RootState) => s.beneficiaries);
  const current = beneficiaries.find(b => b.account === params?.account);
  const { payments } = useSelector((s: RootState) => s.payments);
  const form = useSelector((s: RootState) => s.beneficiaryForm);
  const {generateProofOfPayment, shareTextMessage} = useProof();
  const payment = useMemo(() => payments.find(p => p.id === params?.paymentId), [payments, params?.paymentId]);
  const [selected, setSelected] = useState<OptionKey>('none');
  const {accountInfo} = useAuth();
  const [cell, setCell] = useState('');
  const [email, setEmail] = useState('');
  // Initialize from existing beneficiary values
  useEffect(() => {
    if (current) {
      const t = (current.notificationType as OptionKey) || 'none';
      setSelected(t);
      if (t === 'sms') setCell(current.notificationValue || '');
      if (t === 'email') setEmail(current.notificationValue || '');
    }
  }, [current?.notificationType, current?.notificationValue]);

  const canDone = useMemo(() => {
    if (selected === 'sms') return cell.trim().length > 0;
    if (selected === 'email') return email.trim().length > 0;
    return true;
  }, [selected, cell, email]);
  const handleProof = async (action:'SEND' | 'SHARE', notificationType:string,notificationValue:string) => {
    if(!payment) return;
    try {
      generateProofOfPayment({
        isImmediate: payment.paymentType === 'immediate',
        amount: payment.amount.toString(),
        date: payment.transactionDate,
        beneficiary: payment.beneficiaryName,
        accountNumber: payment.beneficiaryAccount,
        bankName: payment.beneficiaryBank,
        branch: payment.branch || '',
        paymentType: payment.paymentType,
        paymentReference: payment.reference,
        senderName: `${accountInfo?.firstName} ${accountInfo?.lastName}`,
        title: 'Mr',
        notificationType: action === 'SEND' ? notificationType?.toUpperCase() as any : 'SHARE',
        notificationValue: notificationValue,
      })
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <SafeAreaView style={styles.container} edges={['left','right']}>
      <Stack.Screen options={{ title: 'Payment Notification', presentation: 'modal' as any }} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <View style={{justifyContent:'center',marginTop:6}}><Icon name="info" type="MaterialIcons" size={24} color={colors.nedBank} /></View>
          <Text style={styles.infoText}>
            {params?.paymentId ? 'Soon we will be removing the SMS and email capabilities for payment notifications. Share payment notifications by tapping the share field below.' : 'Payment notifications for immediate payments will only be sent after the payment has been processed.'}
          </Text>
        </View>

        {/* Notification Options - Each in separate cards */}
        <View style={styles.optionsContainer}>
          {(params?.paymentId ? [...options].slice(1) : [...options]).map((opt) => (
            <View key={opt.key} style={styles.optionCard}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setSelected(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <View style={[styles.radioOuter, selected === opt.key && styles.radioOuterSelected]}>
                  {selected === opt.key ? <View style={styles.radioInner} /> : null}
                </View>
              </TouchableOpacity>

              {/* Input field for selected option */}
              {selected === 'sms' && opt.key === 'sms' && (
              <View style={[styles.inputSection,{flexDirection:'row'}]}>
                  <View style={{flex:1}}>
                    <TextField
                      label="Cellphone number"
                      value={cell}
                      onChangeText={setCell}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                  <View style={{justifyContent:'center',right:16}}><Icon name='perm-contact-calendar' type='MaterialIcons' color={colors.nedBank} size={24} /></View>
                </View>
              )}

              {selected === 'email' && opt.key === 'email' && (
                <View style={styles.inputSection}>
                  <TextField
                    label="Email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {selected === 'sms' && (
          <View style={styles.noteWrap}>
            <Text style={styles.noteText}>A fee will be charged for each SMS notification.</Text>
          </View>
        )}

        <View style={{ height: 12 }} />
        <View style={{ paddingHorizontal: 16 }}>
          {!params?.paymentId && (
            <LinearButton
              title="Done"
              onPress={async () => {
                const val = selected === 'sms' ? cell : selected === 'email' ? email : '';
                // Update beneficiary form slice (used by add-account)
                dispatch(setField({ key: 'notificationType', value: selected } as any));
                dispatch(setField({ key: 'notificationValue', value: val } as any));

                // If opened from payment-form with a beneficiary account, persist to Firestore and Redux list
                const acct = (params?.account as string) || current?.account;
                if (acct) {
                  const ok = await updateBeneficiaryNotification(acct, selected, val);
                  if (ok) {
                    // update beneficiaries slice in-memory so payment-form reflects immediately
                    const updated = beneficiaries.map((b) =>
                      b.account === acct ? { ...b, notificationType: selected, notificationValue: val } : b
                    );
                    dispatch(setBeneficiaries(updated as any));
                  }
                }

                router.back();
              }}
              disabled={!canDone}
            />
          )}
          {params?.paymentId && (
            <View style={{gap:12}}>
              <LinearButton
                title="Send"
                onPress={async () => {
                  const val = selected === 'sms' ? cell : selected === 'email' ? email : '';
                  await handleProof('SEND',selected,val);
                  // Show success status saying notification sent, with OK button to go back
                  dispatch(showSuccess({
                    title: 'Successful',
                    message: 'Payment notification has been sent.',
                    buttons: [
                      {
                        id: 'ok',
                        title: 'OK',
                        variant: 'primary',
                        action: { type: 'back' },
                      },
                    ],
                  } as any));
                  router.replace('/success-status' as any);
                }}
              />
              <LinearButton
                title="Share payment notification"
                variant="secondary"
                onPress={async () => {
                  const expiryDate = new Date();
                  expiryDate.setDate(expiryDate.getDate() + 30);
                  const formattedExpiryDate = expiryDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  const message = `Capitec: Send Cash
Amount: ${currencyFormatter(payment?.amount || 0)}
Reference number: ${payment?.reference || 'N/A'}
Expiry date: ${formattedExpiryDate}

New. You can now collect your cash at ACKERMANS, PEP, PEP HOME, PEP CELL. Remember to carry your South African ID along with you.
You can also collect your cash at Pick n Pay, Boxer, Checkers, USave, Shoprite or use our Cardless Services at Capitec ATMs.

For enquiries, call 0860102043`;

                  shareTextMessage(message);
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  scroll: { flex: 1 },

  infoBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderLeftWidth: 10,
    borderLeftColor: colors.nedBank,
    margin: 16,
    padding: 12,
    paddingVertical: 15,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.nedBank,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: '#111',
    fontSize: 12,
    fontFamily: Fonts.fontRegular,
    justifyContent: 'center'
  },

  // New card-based layout styles
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: Fonts.fontLight,
    color: '#111',
  },
  inputSection: {
    borderTopWidth: 0.8,
    borderTopColor: colors.borderColor
  },

  // Radio button styles
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  // Note section
  noteWrap: {
    backgroundColor: '#f9fafb',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightGray,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    textAlign: 'center',
    color: '#374151',
    fontFamily: Fonts.fontLight,
    fontSize: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});

