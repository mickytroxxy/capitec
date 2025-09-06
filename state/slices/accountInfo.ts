import { PayloadAction, createSlice } from "@reduxjs/toolkit";
export type AccountType = {
  id: number;
  firstName: string;
  lastName: string;
  accountNumber: string;
  email: string;
  phone: string;
  balance:number;
  pin:string;
  active:boolean;
  notificationToken:string;
  title:'Mr' | 'Miss'
};

const initialState: {
  accountInfo:AccountType | null,
  activeUser:AccountType | null
} = {
  accountInfo:null,
  activeUser:null
};

const accountSlice = createSlice({
  name: "accountSlice",
  initialState,
  reducers: {
    setAccountInfo: (state, action: PayloadAction<AccountType | null>) => {
      state.accountInfo = action.payload;
    },
    setActiveUser: (state, action: PayloadAction<AccountType | null>) => {
      state.activeUser = action.payload;
    }
  },
});

export const { setAccountInfo, setActiveUser } = accountSlice.actions;
export default accountSlice.reducer;
