import LinearButton from '@/components/ui/LinearButton';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { setLoadingState } from '@/state/slices/loader';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

export type ConfirmAddBeneficiaryModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title: string;
  bankName?: string;
  accountNumber?: string;
  beneficiaryName?:string;
  amount:string
};

export default function ConfirmPaymentModal({ visible, onClose, onConfirm, title, bankName, accountNumber, beneficiaryName, amount }: ConfirmAddBeneficiaryModalProps) {
  const [pin, setPin] = React.useState('');
  React.useEffect(() => { if (!visible) setPin(''); }, [visible]);
  const [errorText,setErrorText] = useState('');
  const dispatch = useDispatch()
  const {accountInfo} = useAuth();
  const handlePin = async() => {
    dispatch(setLoadingState({isloading:true,type:'spinner'}));
    setTimeout(() => {
      onConfirm(pin);
    }, 4000);
  }
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          {/* Bank summary */}
          {bankName && accountNumber && (
            <View style={styles.bankRow}>
              <View style={styles.bankPill}>
                <View style={styles.pillAccent} />
                <View style={{flex:1}}>
                  {beneficiaryName && <Text style={{fontFamily:Fonts.fontSemiBold,fontSize:14}}>{beneficiaryName}</Text>}
                  <Text style={{fontFamily:Fonts.fontRegular}}>{bankName} Bank</Text>
                  <Text style={{fontFamily:Fonts.fontRegular,fontSize:12}}>{accountNumber}</Text>
                </View>
                <View><Text style={{fontFamily:Fonts.fontRegular}}>{amount}</Text></View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={{marginTop:14}}>
            <LinearButton title="Confirm Payment" onPress={() => {handlePin()}} />
          </View>
          <TouchableOpacity style={{alignSelf:'center', paddingVertical:12}} onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 14, backgroundColor: colors.white, padding: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  title: { fontSize: 14, textAlign: 'center', marginBottom: 10, fontFamily: Fonts.fontSemiBold },
  bankRow: { paddingHorizontal: 4 },
  bankPill: { backgroundColor: '#f2f8f6ff', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center' },
  pillAccent: { width: 8, height: 60, borderRadius: 6, backgroundColor: colors.primary, marginRight: 10 },
  bankSubtitle: { fontSize: 12, color: colors.gray, fontFamily: Fonts.fontRegular },
  bankAccount: { fontSize: 14, color: '#111', fontFamily: Fonts.fontBold },
  cancel: { color: colors.primary, fontFamily: Fonts.fontBold, fontSize: 14 },
});

