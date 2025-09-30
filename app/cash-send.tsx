import { AccountBalance } from '@/components/payments/AccountBalance';
import ConfirmAddBeneficiaryModal from '@/components/ui/ConfirmAddBeneficiaryModal';
import LinearButton from '@/components/ui/LinearButton';
import TextField from '@/components/ui/TextField';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { setLoadingState } from '@/state/slices/loader';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { currencyFormatter } from './(tabs)';

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
      router.push('/error');
      dispatch(setLoadingState({isloading:false,type:'spinner'}))
      return;
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

            <View style={{borderBottomWidth:0.7,borderBottomColor:colors.borderColor,marginHorizontal:16}} />

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