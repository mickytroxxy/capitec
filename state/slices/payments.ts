import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Type for payment data
type Payment = {
  id: string;
  beneficiaryId: number | undefined;
  beneficiaryName: string;
  beneficiaryAccount: string;
  senderAccount: string | undefined;
  accountsMerged: string[];
  accounts: string[];
  beneficiaryBank: string;
  branch: string;
  amount: number;
  fee: number;
  totalAmount: number;
  reference: string;
  statementDescription: string;
  paymentType: string;
  notificationType: string;
  notificationValue: string;
  status: string;
  transactionDate: number;
  effectiveDate: number;
};

const initialState: {
  payments: Payment[]
} = {
  payments: []
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    }
  },
});

export const { addPayment, setPayments } = paymentsSlice.actions;
export default paymentsSlice.reducer;
