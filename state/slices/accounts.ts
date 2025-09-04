import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AccountsTab = 'cards' | 'virtual';

export type AccountsState = {
  activeTab: AccountsTab;
  onlinePurchases: boolean;
  internationalTransactions: boolean;
  tapToPay: boolean;
};

const initialState: AccountsState = {
  activeTab: 'cards',
  onlinePurchases: true,
  internationalTransactions: true,
  tapToPay: false,
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<AccountsTab>) => {
      state.activeTab = action.payload;
    },
    setToggle: (state, action: PayloadAction<{ key: keyof Omit<AccountsState, 'activeTab'>; value: boolean }>) => {
      const { key, value } = action.payload;
      (state[key] as boolean) = value;
    },
    hydrateSettings: (state, action: PayloadAction<Partial<AccountsState>>) => {
      Object.assign(state, action.payload);
    },
    resetAccounts: () => initialState,
  },
});

export const { setActiveTab, setToggle, hydrateSettings, resetAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;

