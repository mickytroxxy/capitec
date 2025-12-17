import { AccountBalance } from '@/components/payments/AccountBalance';
import ConfirmAddBeneficiaryModal from '@/components/ui/ConfirmAddBeneficiaryModal';
import LinearButton from '@/components/ui/LinearButton';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createData, updateTable } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { setLoadingState } from '@/state/slices/loader';
import { showSuccess } from '@/state/slices/successSlice';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { currencyFormatter } from './(tabs)';
import { schedulePushNotification } from './_layout';

export default function CashSend() {
  const [amount, setAmount] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [amountError, setAmountError] = useState('');
  const [modal,setModal] = useState(false);
  const dispatch = useDispatch();
  const validateAmount = (value: string) => {
    if (!value.trim()) return '';
    
    const numericValue = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    
    if (isNaN(numericValue)) {
      return 'Please enter a valid amount';
    }
    
    if (numericValue < 40) {
      return 'Amount must be at least R40';
    }
    
    if (numericValue > 3000) {
      return 'Amount cannot exceed R3,000';
    }
    
    return '';
  };

  const handleAmountChange = (value: string) => {
    const formattedValue = value.replace(/[^0-9.]/g, '');
    setAmount(formattedValue);
    const error = validateAmount(formattedValue);
    setAmountError(error);
  };

  const canSend = amount && secretCode && !amountError && secretCode.length === 4;
  const { accountInfo } = useAuth();
  const handleSendCash = async () => {
    if (!canSend) return;
    setModal(false);
    dispatch(setLoadingState({isloading:true,type:'spinner'}));
    
    try {
      const cNumber = `C${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      const cashSendData = {
        id: cNumber,
        amount: parseFloat(amount),
        secretCode,
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        senderAccount: accountInfo?.accountNumber,
        senderName: `${accountInfo?.firstName} ${accountInfo?.lastName}`,
      };

      const success = await createData('cashsends', cNumber, cashSendData);

      if (success) {
        // Update account balance
        const newBalance = (accountInfo?.balance || 0) - parseFloat(amount);
        await updateTable('users', accountInfo?.id as any || '', { balance: newBalance });
        
        dispatch(showSuccess({
          title: 'Successful',
          message: `Reference number`,
          cash1: `Send the secret code in a separate message`,
          cash2: 'Cash not collected within 30 days will be paid back into your account',
          sub1:cNumber,
          buttons: [
            {
              id: 'share',
              title: 'Share Reference Number',
              variant: 'primary',
              action: { type: 'custom', payload: 'share-reference', amount:amount } as any
            },
            {
              id: 'done',
              title: 'Done',
              variant: 'secondary',
              action: { type: 'replace', payload: '/(tabs)' }
            }
          ]
        }));

        await schedulePushNotification(
          `Cash send of ${currencyFormatter(parseFloat(amount))} has been created successfully.`,
          'Cash Send Created'
        );
        
        router.push('/success-status');
      } else {
        Alert.alert('Error', 'Failed to create cash send. Please try again.');
      }
    } catch (error) {
      console.error('Error sending cash:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      dispatch(setLoadingState({isloading:false,type:'spinner'}));
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerTitle: 'Send Cash'
      }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.content}>
          {/* Account Balance Component */}
          <AccountBalance />
          
          <View style={styles.spacer} />

            {/* Amount Input */}
            <View style={styles.card}>
              <TextField
                label="Amount (R40 - R3 000)"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                error={amountError}
              />

            <View style={{borderBottomWidth:1,borderBottomColor:colors.borderColor,marginHorizontal:16}} />

            {/* Secret Code Input */}
            <TextField
              label="Create 4-digit secret code"
              value={secretCode}
              onChangeText={(text) => setSecretCode(text.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <Text style={styles.infoText}>
            You need to send this secret code to the recipient in a separate message in order for them to collect the cash.
          </Text>

          <View style={styles.buttonContainer}>
            <LinearButton
              title="Send"
              onPress={() => setModal(true)}
            />
            <View style={styles.spacer} />
            <LinearButton
              title="View History"
              onPress={() => {}}
              variant="secondary"
            />
          </View>
        </View>
      </ScrollView>
      <ConfirmAddBeneficiaryModal
        visible={modal}
        onClose={() => setModal(false)}
        onConfirm={handleSendCash}
        title={`You are about to make send cash of ${currencyFormatter(amount)}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  content: {
    flex: 1,
  },
  spacer: {
    height: 16,
  },
  infoText: {
    marginTop: 12,
    color: colors.black,
    fontFamily: Fonts.fontRegular,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    margin: 16,
  },
  card:{
    backgroundColor:colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1.5,
    overflow: 'hidden',
  }
});