import { currencyFormatter } from '@/app/(tabs)';
import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useProof } from '@/hooks/useProof';
import { SuccessButton } from '@/state/slices/successSlice';
import { RootState } from '@/state/store';
import { router, Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useMemo } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
export default function SuccessStatusScreen() {
  const dispatch = useDispatch();
  const { title, message, subMessage, buttons, isVisible, paymentData, sub1, cash1, cash2 } = useSelector((state: RootState) => state.success);
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
          console.log('No paymentk data available for PDF generation');
        }
        break;
      case 'share-reference':
        try {
          if (!(await Sharing.isAvailableAsync())) {
              Alert.alert('Error', 'Sharing is not available on this device');
              return;
          }

          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          const formattedExpiryDate = expiryDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });

          const message = `Capitec: Send Cash
Amount: ${currencyFormatter(buttons?.[0]?.action?.amount || 0)}
Reference number: ${sub1}
Expiry date: ${formattedExpiryDate}

New. You can now collect your cash at ACKERMANS, PEP, PEP HOME, PEP CELL. Remember to carry your South African ID along with you.
You can also collect your cash at Pick n Pay, Boxer, Checkers, USave, Shoprite or use our Cardless Services at Capitec ATMs.

For enquiries, call 0860102043`;

          await Share.share({
            message: message,
            title: 'Share Payment Reference',
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to share reference');
        }
      default:
        //router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Success banner */}
      <View style={styles.successHeader}>
        <Text style={styles.successTitle}>{title}</Text>
      </View>

      {/* Check badge overlaps header */}
      <View style={styles.badgeWrap}>
        <View style={styles.badge}>
          <Icon name="check" type="Feather" size={48} color={colors.white} />
        </View>
      </View>

      {/* Message */}
      <View style={styles.body}>
        <View style={{backgroundColor:colors.white}}>
          <Text style={styles.message}>{message}</Text>
          {sub1 && <Text style={[styles.message, styles.sub1]}>{sub1}</Text>}
          
          {cash1 && (
            <>
              <View style={{ height: 12 }} />
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.subMessage, styles.cashText]}>{cash1}</Text>
              </View>
            </>
          )}
          
          {cash2 && (
            <View style={[styles.bulletPoint,{marginTop:4}]}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.subMessage, styles.cashText]}>{cash2}</Text>
            </View>
          )}
          {sub1 &&
            <Text style={{fontFamily:Fonts.fontMedium,color:colors.primary,textAlign:'center',marginTop:15}}>View History</Text>
          }
          {subMessage && !cash1 && !cash2 && (
            <>
              <View style={{ height: 12 }} />
              <Text style={styles.subMessage}>{subMessage}</Text>
            </>
          )}


          <View style={{ height: 24 }} />
        </View>

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
    fontFamily: Fonts.fontRegular,
    marginTop:-40
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
  sub1: {
    fontSize: 18,
    fontFamily: Fonts.fontMedium,
    marginTop: 8,
    color: colors.black,
  },
  subMessage: {
    textAlign: 'center',
    color: '#374151',
    fontFamily: Fonts.fontRegular,
    fontSize: 14,
    lineHeight: 16,
    justifyContent:'center'
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    justifyContent:'center'
  },
  bullet: {
    fontSize: 14,
    marginRight: 8,
    color: '#374151',
    justifyContent:'center'
  },
  cashText: {
    textAlign: 'left',
    flex: 1,
  },
  cash2: {
    marginTop: 4,
    fontSize: 12,
    color: colors.gray,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 16,
  },
});
