import { updateCardSettings } from '@/api';
import { colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { setToggle } from '@/state/slices/accounts';
import { hideConfirmDialog } from '@/state/slices/confirmDialog';
import { RootState } from '@/state/store';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearButton from './LinearButton';

export default function ConfirmDialog() {
  const dispatch = useDispatch();
  const { accountInfo } = useAuth();
  const { visible, title, message, confirmText, cancelText, nextAction } = useSelector((s: RootState) => s.confirmDialog);
  if (!visible) return null;

  const onConfirm = async () => {
    // Execute the next action if provided
    if (nextAction?.slice === 'accounts' && nextAction.reducer === 'setToggle') {
      dispatch(setToggle(nextAction.payload));
      // Persist remotely (best-effort)
      const key = nextAction.payload?.key as 'onlinePurchases' | 'internationalTransactions' | 'tapToPay';
      const value = nextAction.payload?.value as boolean;
      try {
        if (accountInfo?.accountNumber) {
          await updateCardSettings(accountInfo.accountNumber, { [key]: value } as any);
        }
      } catch (e) {
        // ignore best-effort errors
      }
    }
    dispatch(hideConfirmDialog());
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={() => dispatch(hideConfirmDialog())} />
      <View style={styles.centered}>
        <View style={styles.card}>
          <Text style={styles.title}>{title || 'Are you sure?'}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => dispatch(hideConfirmDialog())}>
              <Text style={styles.cancelText}>{cancelText || 'Cancel'}</Text>
            </TouchableOpacity>
            <LinearButton title={confirmText || 'Confirm'} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 14, backgroundColor: colors.white, padding: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  title: { fontSize: 15, color: '#111', textAlign: 'center', marginBottom: 8, fontFamily: Fonts.fontBold },
  message: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 12, fontFamily: Fonts.fontLight },
  row: { flexDirection: 'row', gap: 12, marginTop: 6 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.gray },
  cancelText: { color: colors.gray, fontFamily: Fonts.fontBold },
});

