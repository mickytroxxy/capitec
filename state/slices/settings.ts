import { PayloadAction, createSlice } from "@reduxjs/toolkit";
export type SettingsTypes = {
    capitecAllowed:boolean,
    immediateAllowed:boolean,
    capitecErrorMsg:string,
    immediateErrorMsg:string,
    useRealMoney:boolean,
    useRealMoneyErrorMsg:string,
}
const initialState: SettingsTypes = {
    capitecAllowed:false,
    immediateAllowed:false,
    capitecErrorMsg:'Unable to process your transaction. We are aware of the issue and aim to have it resolved.',
    immediateErrorMsg:'Unable to process your transaction. Please visit your nearest branch to complete your KYC.',
    useRealMoney:false,
    useRealMoneyErrorMsg:'You have insufficient funds in your real account to process this Immediate payment.',
};

const settingSlice = createSlice({
  name: "settingSlice",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<SettingsTypes>) => {
      return action.payload;
    }
  },
});

export const { setSettings } = settingSlice.actions;
export default settingSlice.reducer;
