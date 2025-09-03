import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'none' | 'sms' | 'email';

export type BeneficiaryFormState = {
  name: string;
  account: string;
  bank: string;
  branch: string;
  reference: string;
  oneTime: boolean;
  notificationType: NotificationType;
  notificationValue: string;
};

const initialState: BeneficiaryFormState = {
  name: '',
  account: '',
  bank: '',
  branch: '',
  reference: '',
  oneTime: false,
  notificationType: 'none',
  notificationValue: '',
};

const beneficiaryFormSlice = createSlice({
  name: 'beneficiaryForm',
  initialState,
  reducers: {
    setField<K extends keyof BeneficiaryFormState>(state, action: PayloadAction<{ key: K; value: BeneficiaryFormState[K] }>) {
      const { key, value } = action.payload;
      (state as any)[key] = value as any;
    },
    resetForm() {
      return initialState;
    },
  },
});

export const { setField, resetForm } = beneficiaryFormSlice.actions;
export default beneficiaryFormSlice.reducer;

