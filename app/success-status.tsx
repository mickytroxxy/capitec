import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useProof } from '@/hooks/useProof';
import { SuccessButton } from '@/state/slices/successSlice';
import { RootState } from '@/state/store';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function SuccessStatusScreen() {
  const dispatch = useDispatch();
  const { title, message, subMessage, buttons, isVisible, paymentData } = useSelector((state: RootState) => state.success);
  const {accountInfo} = useAuth();
  const { payments } = useSelector((s: RootState) => s.payments);
  const form = useSelector((s: RootState) => s.beneficiaryForm);
  const {generateProofOfPayment} = useProof();
  const payment = useMemo(() => payments.find(p => p.id === paymentData), [payments, paymentData]);
  const isGenerating = false;

  const handleButtonPress = (button: SuccessButton) => {
    //dispatch(hideSuccess());
    
    switch (button.action.type) {
      case 'navigate':
        router.push(button.action.payload as any);
        break;
      case 'replace':
        if (typeof button.action.payload === 'string') {
          router.replace(button.action.payload as any);
        } else {
          router.replace(button.action.payload);
        }
        break;
      case 'back':
        router.back();
        break;
      case 'custom':
        handleCustomAction(button.action.payload);
        break;
      default:
        router.replace('/(tabs)');
    }
  };

  const handleCustomAction = async (actionType: string) => {
    switch (actionType) {
      case 'send-notification':
        if (paymentData && payment) {
          generateProofOfPayment({
            isImmediate: payment.paymentType === 'immediate',
            amount: payment.amount.toString(),
            date: payment.transactionDate,
            beneficiary: payment.beneficiaryName,
            accountNumber: payment.beneficiaryAccount,
            bankName: payment.beneficiaryBank,
            branch: payment?.branch,
            paymentType: payment.paymentType,
            paymentReference: payment.reference,
            senderName: `${accountInfo?.firstName} ${accountInfo?.lastName}`,
            title: 'Mr',
            notificationType: 'SHARE',
            notificationValue: form.notificationValue,
          })
        } else {
          console.log('No payment data available for PDF generation');
        }
        break;
      default:
        router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" backgroundColor={colors.tertiary} />
      {/* Success banner */}
      <View style={styles.successHeader}>
        <Text style={styles.successTitle}>{title}</Text>
      </View>

      {/* Check badge overlaps header */}
      <View style={styles.badgeWrap}>
        <View style={styles.badge}>
          <Icon name="check" type="Feather" size={36} color={colors.white} />
        </View>
      </View>

      {/* Message */}
      <View style={styles.body}>
        <Text style={styles.message}>{message}</Text>

        {subMessage && (
          <>
            <View style={{ height: 12 }} />
            <Text style={styles.subMessage}>{subMessage}</Text>
          </>
        )}

        <View style={{ height: 24 }} />

        {/* Dynamic buttons */}
        <View style={styles.buttonContainer}>
          {buttons.map((button, index) => (
            <View key={button.id}>
              <LinearButton
                title={isGenerating && button.action.payload === 'send-notification' ? 'Generating PDF...' : button.title}
                variant={button.variant || 'primary'}
                onPress={() => handleButtonPress(button)}
                disabled={isGenerating && button.action.payload === 'send-notification'}
              />
              {index < buttons.length - 1 && <View style={{ height: 14 }} />}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  successHeader: {
    height: 120,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: colors.white,
    fontSize: 16,
    fontFamily: Fonts.fontMedium,
  },
  badgeWrap: {
    alignItems: 'center',
  },
  badge: {
    marginTop: -32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: colors.white,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  message: {
    textAlign: 'center',
    color: '#374151',
    fontFamily: Fonts.fontRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  subMessage: {
    textAlign: 'center',
    color: '#374151',
    fontFamily: Fonts.fontRegular,
    fontSize: 14,
    lineHeight: 16,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});
