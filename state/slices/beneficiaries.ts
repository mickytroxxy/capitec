import { AddBeneficiaryPayload } from "@/api";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Type for transformed beneficiary data that matches UI expectations
type TransformedBeneficiary = Omit<AddBeneficiaryPayload, 'id'> & {
  id: number;
  avatar: string;
  accountNumber: string;
  lastPaid: string;
};

const initialState: {
  beneficiaries: TransformedBeneficiary[]
} = {
  beneficiaries:[]
};

const beneficiaries = createSlice({
  name: "beneficiaries",
  initialState,
  reducers: {
    setBeneficiaries: (state, action: PayloadAction<TransformedBeneficiary[]>) => {
      state.beneficiaries = action.payload;
    },
  },
});

export const { setBeneficiaries } = beneficiaries.actions;
export default beneficiaries.reducer;
