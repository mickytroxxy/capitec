import LinearButton from '@/components/ui/LinearButton';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { RootState } from '@/state/store';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { currencyFormatter } from './(tabs)';

// Only accept an ID via params; everything else is derived from the store
export default function PaymentDetailsScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId?: string }>();
  const { payments } = useSelector((s: RootState) => s.payments);

  const payment = useMemo(() => payments.find(p => p.id === paymentId), [payments, paymentId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getNotificationDisplay = (type?: string) => {
    if (type === 'sms') return 'SMS';
    if (type === 'email') return 'Email';
    return 'None';
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Details',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontFamily: Fonts.fontMedium },
        }}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Payment Details */}
          <View style={styles.detailsContainer}>
            <DetailRow label="Beneficiary name" value={payment?.beneficiaryName || ''} />
            {/* Bank name (secondary) */}
            <DetailRow label="" value={payment?.beneficiaryBank || ''} secondary />
            {/* Account number (strong, no label) */}
            <DetailRow label="" value={payment?.beneficiaryAccount || ''} />

            <DetailRow label="Amount" value={currencyFormatter(Number(payment?.amount || 0))} />

            <DetailRow label="From account" value={payment?.senderAccount || ''} />

            <DetailRow label="Beneficiary reference" value={payment?.reference || ''} />

            <DetailRow label="My statement description" value={payment?.statementDescription || ''} />

            <DetailRow label="Transaction date" value={formatDate(payment?.transactionDate as any)} />

            <DetailRow label="Payment notification" value={getNotificationDisplay(payment?.notificationType)} />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <LinearButton
              title="Send Payment Notification"
              onPress={() => {
                // Placeholder: send/preview notification
                router.push({ pathname: '/payment-notification', params: { account: payment?.beneficiaryAccount, action:'PROCEED', paymentId } as any })
              }}
            />

            <LinearButton
              variant="secondary"
              title="Pay Again"
              onPress={() => {
                // Navigate back to payment form with same beneficiary
                router.back();
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: string;
  secondary?: boolean;
}

function DetailRow({ label, value, secondary = false }: DetailRowProps) {
  if (secondary) {
    return (
      <View style={styles.secondaryRow}>
        <Text style={styles.secondaryValue}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={styles.detailRow}>
      {label ? <Text style={styles.detailLabel}>{label}</Text> : null}
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.faintGray,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flex: 1,
  
  },
  detailsContainer: {
    backgroundColor: colors.white,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
    marginBottom: 24,
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Fonts.fontRegular,
    color: colors.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: Fonts.fontMedium,
    color: '#111',
  },
  secondaryRow: {
    marginBottom: 8,
  },
  secondaryValue: {
    fontSize: 14,
    fontFamily: Fonts.fontRegular,
    color: colors.gray,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
});