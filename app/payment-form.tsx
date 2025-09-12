import { AccountBalance } from '@/components/payments/AccountBalance';
import { History } from '@/components/payments/History';
import ConfirmAddBeneficiaryModal from '@/components/ui/ConfirmAddBeneficiaryModal';
import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createData, loginApi, updateTable } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useProof } from '@/hooks/useProof';
import { setAccountInfo } from '@/state/slices/accountInfo';
import { setBeneficiaries } from '@/state/slices/beneficiaries';
import { setLoadingState } from '@/state/slices/loader';
import { addPayment } from '@/state/slices/payments';
import { showSuccess, successConfigs } from '@/state/slices/successSlice';
import { RootState } from '@/state/store';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { currencyFormatter } from './(tabs)';
import { schedulePushNotification } from './_layout';

export default function PaymentFormScreen() {
  const params = useLocalSearchParams<{account?: string }>();
  const {beneficiaries} = useSelector((s: RootState) => s.beneficiaries);
  const form = useMemo(() => beneficiaries.find(b => b.account === params?.account), [beneficiaries, params?.account]);
  const {accountInfo} = useAuth();
  const {generateProofOfPayment} = useProof();
  const dispatch = useDispatch();
  const beneficiaryName = form?.name || '';
  const bankName = form?.bank || '';
  const branch = form?.branch || '';
  const accountNumber = form?.account || '';
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [statement, setStatement] = useState(beneficiaryName || '');
  const [activeTab, setActiveTab] = useState<'payment' | 'history'>('payment');
  const [amountError, setAmountError] = useState('');
  const [referenceError, setReferenceError] = useState('');
  const [statementError, setStatementError] = useState('');
  const [modal, setModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState<'normal' | 'immediate'>('normal');
  const [currentPaymentId, setCurrentPaymentId] = useState<string>('');
  const isCapitec = bankName.toLowerCase().includes('capitec');
  const validateAmount = (value: string) => {
    if (!value.trim()) {
      return 'Amount is required';
    }

    const numericValue = parseFloat(value.replace(/\s/g, '').replace(',', '.'));

    if (isNaN(numericValue)) {
      return 'Please enter a valid amount';
    }

    if (numericValue <= 0) {
      return 'Amount must be greater than 0';
    }

    if (numericValue > (accountInfo?.balance || 0)) {
      return 'Insufficient funds';
    }

    if (numericValue > 999999.99) {
      return 'Amount exceeds maximum limit';
    }

    return '';
  };

  const validateReference = (value: string) => {
    if (!value.trim()) {
      return 'Beneficiary reference is required';
    }
    if (value.length > 20) {
      return 'Reference must be 20 characters or less';
    }
    return '';
  };

  const validateStatement = (value: string) => {
    if (!value.trim()) {
      return 'Statement description is required';
    }
    if (value.length > 20) {
      return 'Statement description must be 20 characters or less';
    }
    return '';
  };

  const formatAmountInput = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }

    return cleaned;
  };

  const handleAmountChange = (value: string) => {
    const formattedValue = formatAmountInput(value);
    setAmount(formattedValue);
    const error = validateAmount(formattedValue);
    setAmountError(error);
  };

  const handleReferenceChange = (value: string) => {
    setReference(value);
    const error = validateReference(value);
    setReferenceError(error);
  };

  const handleStatementChange = (value: string) => {
    setStatement(value);
    const error = validateStatement(value);
    setStatementError(error);
  };

  // Fee calculation based on Capitec rules
  const calculateFee = (bankName: string, isImmediate: boolean = false) => {
    const isCapitec = bankName.toLowerCase().includes('capitec');

    if (isImmediate && !isCapitec) {
      return 6.00; // R6 for immediate payments to other banks
    } else if (isCapitec) {
      return 1.00; // R1 for Capitec payments
    } else {
      return 2.00; // R2 for other banks
    }
  };

  const paymentFee = useMemo(() => {
    return calculateFee(bankName, paymentType === 'immediate');
  }, [bankName, paymentType]);

  const totalAmount = useMemo(() => {
    const amountValue = parseFloat(amount.replace(/\s/g, '').replace(',', '.')) || 0;
    return amountValue + paymentFee;
  }, [amount, paymentFee]);

  const canPay = useMemo(() => {
    const a = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    const hasEnoughBalance = totalAmount <= (accountInfo?.balance || 0);
    return !isNaN(a) && a > 0 && !amountError && !referenceError && !statementError &&
           amount.trim() && reference.trim() && statement.trim() && hasEnoughBalance;
  }, [amount, amountError, referenceError, statementError, reference, statement, totalAmount, accountInfo?.balance]);

  const onConfirm = async () => {
    const isCapitec = bankName.toLowerCase().includes('capitec');
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if(paymentType === 'immediate' || isCapitec){
        router.push('/error');
        dispatch(setLoadingState({isloading:false,type:'spinner'}))
        return;
      }
      // Validate one last time before processing
      const paymentAmount = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
      const paymentId = currentPaymentId;

      // Create payment record
      const paymentData = {
        id: paymentId,
        beneficiaryId: form?.id ?? 0,
        beneficiaryName: beneficiaryName,
        beneficiaryAccount: accountNumber,
        branch: branch,
        senderAccount: accountInfo?.accountNumber,
        accountsMerged:[`${accountInfo?.accountNumber}_${accountNumber}`,`${accountNumber}_${accountInfo?.accountNumber}`],
        accounts:[accountInfo?.accountNumber,accountNumber],
        beneficiaryBank: bankName,
        amount: paymentAmount,
        fee: 0,
        totalAmount: paymentAmount,
        reference: reference,
        statementDescription: statement,
        paymentType: paymentType,
        notificationType: form?.notificationType || 'none',
        notificationValue: form?.notificationValue || '',
        status: 'completed',
        transactionDate: Date.now(),
        effectiveDate: Date.now(),
      };

      // Save payment to Firebase
      const success = await createData('payments', paymentId, paymentData);

      // Create a separate fee transaction to app account 1234567890
      const feeId = `FEE_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const feeData = {
        id: feeId,
        beneficiaryId: 1234567890,
        beneficiaryName: 'Payment Fee', //paymentType === 'immediate' ? 'Immediate Payment Fee' : 'Payment Fee',
        beneficiaryAccount: '1234567890',
        senderAccount: accountInfo?.accountNumber,
        accountsMerged:[`${accountInfo?.accountNumber}_1234567890`,`1234567890_${accountInfo?.accountNumber}`],
        accounts:[accountInfo?.accountNumber,'1234567890'],
        beneficiaryBank: 'Capitec Bank',
        amount: paymentFee,
        fee: 0,
        totalAmount: paymentFee,
        reference: reference,
        statementDescription: 'Payment fee',//paymentType === 'immediate' ? 'Immediate payment fee' : 'Payment fee',
        paymentType: paymentType,
        notificationType: 'none',
        notificationValue: '',
        status: 'completed',
        transactionDate: Date.now(),
        effectiveDate: Date.now(),
      } as const;

      if (paymentFee > 0) {
        await createData('payments', feeId, feeData as any);
      }

      if (success) {
        dispatch(addPayment(paymentData as any))
        const newBalance = (accountInfo?.balance || 0) - totalAmount;
        dispatch(setAccountInfo({
          ...accountInfo!,
          balance: newBalance
        }));

        // Update beneficiary's last paid date with timestamp
        const lastPaidTimestamp = Date.now();
        const updatedBeneficiaries = beneficiaries.map(b =>
          b.id === form?.id
            ? { ...b, lastPaid: new Date(lastPaidTimestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
            : b
        );
        dispatch(setBeneficiaries(updatedBeneficiaries));

        await updateTable('beneficiaries', form?.account || '', { lastPaid: lastPaidTimestamp });
        await updateTable('users', accountInfo?.id as any || '', { balance: newBalance });

        // Hard refresh account info from backend to ensure consistency
        try {
          const refreshed = await loginApi(accountInfo?.accountNumber || '', accountInfo?.pin || '');
          if (refreshed && refreshed[0]) {
            dispatch(setAccountInfo(refreshed[0] as any));
          }
        } catch (e) {
          // ignore and keep local state
        }



        const config = successConfigs.paymentCompleted(
          beneficiaryName,
          currencyFormatter(totalAmount - paymentFee),
          paymentId
        );
        dispatch(setLoadingState({isloading:false,type:'spinner'}))
        dispatch(showSuccess(config));
        router.replace('/success-status' as any);
        schedulePushNotification(`Payment of ${currencyFormatter(paymentAmount)} to ${beneficiaryName} has been completed.`, 'Payment completed');
        if(form?.notificationType !== 'none'){
          generateProofOfPayment({
            isImmediate: false,//paymentType === 'immediate',
            amount:paymentAmount?.toString(),
            date: Date.now(),
            beneficiary: beneficiaryName,
            accountNumber: accountNumber,
            bankName: bankName,
            branch: form?.branch || '',
            paymentType: paymentType,
            paymentReference: reference,
            senderName: `${accountInfo?.firstName} ${accountInfo?.lastName}`,
            title: 'Mr',
            notificationType: form?.notificationType?.toUpperCase() as any,
            notificationValue: form?.notificationValue || '',
          })
        }
      } else {
        Alert.alert('Error', 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setModal(false);
    }
  }
  useEffect(() => {
    const initialReference = `${accountInfo?.firstName?.slice(0,1)} ${accountInfo?.lastName}` || '';
    setReference(initialReference);

    // Generate payment ID
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    setCurrentPaymentId(paymentId);

    // Validate initial values
    setAmountError(validateAmount(amount));
    setReferenceError(validateReference(initialReference));
    setStatementError(validateStatement(statement));
  }, [accountInfo?.firstName, accountInfo?.lastName])
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen options={{
        headerTitle: 'Pay Beneficiary',
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/payment-notification', params: { account: form?.account, paymentId: currentPaymentId } as any })} activeOpacity={0.8} style={{ left: 10 }}>
            <Icon name="more-vertical" type="Feather" size={24} color={colors.white} />
          </TouchableOpacity>
        )
      }} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top summary header */}
        <View style={styles.headerBlue}>
          <Text style={styles.beneficiaryName}>{beneficiaryName}</Text>
          <Text style={styles.bankName}>{bankName}</Text>
          <Text style={styles.accountNo}>{accountNumber}</Text>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity onPress={() => setActiveTab('payment')} activeOpacity={0.8} style={[styles.tab, activeTab === 'payment' && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === 'payment' && styles.tabActiveText]}>Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('history')} activeOpacity={0.8} style={[styles.tab, activeTab === 'history' && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === 'history' && styles.tabActiveText]}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'payment' ? (
          <>
            {/* From section */}
            <AccountBalance/>

            <View style={[styles.card,{marginTop:12}]}>
              <View>
                <TextField
                  label="Amount"
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  error={amountError}
                />
                <View style={{height:0.7,backgroundColor:colors.borderColor,marginVertical:1,marginHorizontal:15}}/>
                <TextField
                  label="Beneficiary reference"
                  value={reference}
                  onChangeText={handleReferenceChange}
                  error={referenceError}
                />
                <View style={{height:0.7,backgroundColor:colors.borderColor,marginVertical:1,marginHorizontal:15}}/>
                <TextField
                  label="Statement description"
                  value={statement}
                  onChangeText={handleStatementChange}
                  error={statementError}
                />
              </View>
            </View>

            {/* Payment notification */}
            <Text style={styles.sectionTitle}>Payment notification</Text>
            <View style={styles.card}>
              <TextField
                isDropdown
                label="Choose notification type"
                value={form?.notificationType === 'none' ? 'None' : form?.notificationType?.toUpperCase() || 'None'}
                onChangeText={() => {}}
                editable={false}
                rightChevron
                onPressRight={() => router.push({ pathname: '/payment-notification', params: { account: form?.account, paymentId: currentPaymentId } as any })}
              />
            </View>

            {/* Effective date */}
            <View style={{ alignItems: 'center', paddingVertical: 18 }}>
              <Text style={styles.effective}>Effective date: {new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>

            {/* Pay button */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 28, gap: 10 }}>
              <LinearButton
                title={`Pay`}
                onPress={() => {
                  if (canPay) {
                    setPaymentType('normal');
                    setModal(true);
                  }
                }}
              />
              {!isCapitec &&
                <LinearButton
                  variant='secondary'
                  title={`Immediate Payment`}
                  onPress={() => {
                    if (canPay) {
                      setPaymentType('immediate');
                      setModal(true);
                    }
                  }}
                />
              }
            </View>
          </>
        ) : (
          // History Tab Content (placeholder)
          <View style={{}}>
            <History accountNo={accountNumber} />
          </View>
        )}
      </ScrollView>
      <ConfirmAddBeneficiaryModal
        visible={modal}
        onClose={() => setModal(false)}
        onConfirm={onConfirm}
        title={`You are about to pay ${currencyFormatter(totalAmount)} to ${beneficiaryName}`}
        bankName={bankName}
        accountNumber={accountNumber}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.faintGray },
  scroll: { flex: 1 },
  headerBlue: { backgroundColor: colors.primary, paddingTop: 16, paddingBottom: 14, alignItems: 'center' },
  beneficiaryName: { color: '#fff', fontSize: 16, fontFamily: Fonts.fontBold },
  bankName: { color: '#eaf6ff', fontSize: 13, marginTop: 4, fontFamily: Fonts.fontRegular },
  accountNo: { color: '#eaf6ff', fontSize: 13, marginTop: 2, fontFamily: Fonts.fontRegular },
  tabsRow: { flexDirection: 'row', marginTop: 18, alignSelf: 'stretch', paddingHorizontal: 16 },
  tabActive: { flex: 1, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#fff', paddingBottom: 8 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  tabActiveText: { color: '#fff', fontFamily: Fonts.fontBold },
  tabText: { color: '#e0f1ff', fontFamily: Fonts.fontRegular },

  sectionCard: { backgroundColor: colors.white, marginTop: 10, borderTopColor: colors.lightGray, borderTopWidth: StyleSheet.hairlineWidth },
  sectionTitle: { fontSize: 14, color: '#333', paddingHorizontal: 16, paddingVertical: 12, fontFamily: Fonts.fontBold },
  card: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 1.5 },

  fromRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lightGray },
  fromLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fromIconBox: { alignItems: 'center', justifyContent: 'center'},
  fromTitle: { fontFamily: Fonts.fontBold, color: '#111' },
  fromSubtitle: { fontFamily: Fonts.fontLight, color: colors.gray, marginTop: 2, fontSize: 12 },
  fromRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balance: { fontFamily: Fonts.fontBold, color: '#111' },

  valueRow: { paddingHorizontal: 16, paddingBottom: 12 },
  valueBold: { fontFamily: Fonts.fontBold, color: '#111' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.lightGray, marginHorizontal: 0, marginVertical: 8 },

  rowNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lightGray },
  rowTitle: { fontFamily: Fonts.fontBold, color: '#111' },
  rowSubtitle: { fontFamily: Fonts.fontLight, color: '#333', marginTop: 2 },

  effective: { color: colors.black, fontFamily: Fonts.fontLight },

  // Fee section styles
  feeSection: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    fontFamily: Fonts.fontLight,
    color: colors.gray,
  },
  feeValue: {
    fontSize: 14,
    fontFamily: Fonts.fontMedium,
    color: '#111',
  },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGray,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: Fonts.fontBold,
    color: '#111',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: Fonts.fontBold,
    color: colors.primary,
  },
});
