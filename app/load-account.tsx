import Icon from '@/components/ui/Icon';
import LinearButton from '@/components/ui/LinearButton';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { createData, updateTable } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { setAccountInfo } from '@/state/slices/accountInfo';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Clipboard, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { currencyFormatter } from './(tabs)';
import { schedulePushNotification } from './_layout';

export default function LoadAccountScreen() {
    const [amount,setAmount] = useState('');
    const [statement,setStatement] = useState('')
    const {accountInfo} = useAuth();
    const dispatch = useDispatch();
    const options = ["Payment Received", "Cash Deposit"];
    const handleLoadAccount = async() => {
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const accountNumber = Date.now();
      const beneficiaryName = accountInfo?.firstName || '';
      const statementDescription = statement === '' ? options[Math.floor(Math.random() * options.length)] : statement;
      if(amount){
        const paymentData = {
          id: paymentId,
          beneficiaryId: accountInfo?.id,
          beneficiaryName: accountInfo?.firstName || '',
          beneficiaryAccount: accountInfo?.accountNumber,
          branch: 250665,
          senderAccount: accountInfo?.accountNumber,
          accountsMerged:[`${accountNumber}_${accountInfo?.accountNumber}`,`${accountInfo?.accountNumber}_${accountNumber}`],
          accounts:[accountInfo?.accountNumber,accountNumber],
          beneficiaryBank: 'Capitec',
          amount: amount,
          fee: 0,
          totalAmount: amount,
          reference: 'refertye$$',
          statementDescription,
          paymentType: 'Immediate Payment',
          notificationType: 'none',
          notificationValue: '',
          status: 'completed',
          transactionDate: Date.now(),
          effectiveDate: Date.now(),
        };
  
        // Save payment to Firebase
        const success = await createData('payments', paymentId, paymentData);
        if(success){
          const balance = parseFloat(amount) + parseFloat((accountInfo?.balance as any || '0'));
          await updateTable('users',accountInfo?.id as any,{balance});
          dispatch(setAccountInfo({...accountInfo,balance} as any))
          schedulePushNotification(`Capitec: Payment of ${currencyFormatter(amount)} to ${beneficiaryName} has been completed.`, 'Payment completed');
          alert('Amount loaded!')
        }
      }
    }
    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
                <Stack.Screen options={{ title: 'Load Account' }} />
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Icon name="credit-card" type="Feather" size={48} color={colors.primary} />
                    </View>

                    <Text style={styles.title}>Load Your Account</Text>
                    
                    <View style={styles.instructionCard}>
                        <Text style={styles.instructionText}>
                            If you want to load your account you have to buy bitcoin to USDT CELO {' '}
                            <Text onPress={() => Clipboard.setString('0x61bfd2426f009c65f5d8861bef7af745dbf5b07c')} style={styles.bitcoinAddress}>{`0x61bfd2426f009c65f5d8861bef7af745dbf5b07c`}</Text> address and share screenshot on whatsapp at{' '}
                            <Text style={styles.phoneNumber}>0733494836</Text>
                        </Text>
                    </View>

                    <View style={styles.exampleCard}>
                        <Text style={styles.exampleTitle}>Example:</Text>
                        <Text style={styles.exampleText}>
                        If a person wants R10,000, they should buy bitcoin of 25% which is R2,500
                        </Text>
                    </View>

                    <View style={styles.stepsContainer}>
                        <Text style={styles.stepsTitle}>Steps to Load Account:</Text>
                        
                        <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>Calculate 25% of the amount you want to load</Text>
                        </View>

                        <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>Buy Bitcoin worth that amount</Text>
                        </View>

                        <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>Send Bitcoin to the provided address</Text>
                        </View>

                        <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.stepText}>Share transaction screenshot on WhatsApp: 0733494836</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.whatsappButton} onPress={() => Linking.openURL('https://wa.me/0733494836')}>
                        <Icon name="message-circle" type="Feather" size={20} color="#fff" />
                        <Text style={styles.whatsappButtonText}>Contact WhatsApp</Text>
                    </TouchableOpacity>

                    <View style={{marginTop:30}}>
                      <LinearButton title="Login With Another Account" onPress={() => {
                        router.push({pathname:'/enter-pin',params:{action:'fresh'}})
                      }} />
                    </View>
                    <View style={{marginTop:100,width:'100%'}}>
                      <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#b9b7b7ff',
                            borderRadius: 3,
                            padding: 12,
                            paddingVertical:15,
                            fontSize: 14,
                            color: '#111',
                            fontFamily: Fonts.fontMedium,
                            marginBottom: 10,
                            backgroundColor:'#fff'
                          }}
                          value={amount}
                          onChangeText={setAmount}
                          placeholder="Amount"
                          placeholderTextColor={colors.gray}
                          keyboardType="number-pad"
                          maxLength={6}
                        />

                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#b9b7b7ff',
                            borderRadius: 3,
                            padding: 12,
                            paddingVertical:15,
                            fontSize: 14,
                            color: '#111',
                            fontFamily: Fonts.fontMedium,
                            marginBottom: 10,
                            backgroundColor:'#fff'
                          }}
                          value={statement}
                          onChangeText={setStatement}
                          placeholder="Statement"
                          placeholderTextColor={colors.gray}
                          keyboardType="default"
                          maxLength={30}
                        />

                        <View style={{marginTop:30}}>
                          <LinearButton title="Load Account" onPress={() => {
                            handleLoadAccount()
                          }} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  scroll: { 
    backgroundColor: '#fff' 
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.fontBold,
    color: colors.primary,
  },
  placeholder: {
    width: 40,
  },

  content: {
    padding: 20,
    alignItems: 'center',
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.fontBold,
    color: colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },

  instructionCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: Fonts.fontRegular,
    color: '#37474F',
    lineHeight: 24,
  },
  bitcoinAddress: {
    fontFamily: Fonts.fontBold,
    color: colors.primary,
  },
  phoneNumber: {
    fontFamily: Fonts.fontBold,
    color: '#25D366',
  },

  exampleCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  exampleTitle: {
    fontSize: 16,
    fontFamily: Fonts.fontBold,
    color: '#E65100',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: Fonts.fontRegular,
    color: '#E65100',
    lineHeight: 20,
  },

  stepsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stepsTitle: {
    fontSize: 18,
    fontFamily: Fonts.fontBold,
    color: colors.primary,
    marginBottom: 16,
  },

  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: Fonts.fontBold,
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.fontLight,
    color: '#37474F',
    lineHeight: 20,
  },

  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.fontBold,
    marginLeft: 8,
  },
});
