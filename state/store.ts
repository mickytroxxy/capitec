import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import ExpoFileSystemStorage from 'redux-persist-expo-filesystem';
import accountInfo from './slices/accountInfo';
import accounts from './slices/accounts';
import beneficiaries from './slices/beneficiaries';
import beneficiaryForm from './slices/beneficiaryFormSlice';
import confirmDialog from './slices/confirmDialog';
import payments from './slices/payments';
import success from './slices/successSlice';
const rootReducer = combineReducers({
  beneficiaryForm,
  accountInfo,
  beneficiaries,
  success,
  payments,
  accounts,
  confirmDialog,
});

const persistConfig = {
  key: 'root',
  storage: ExpoFileSystemStorage,
  whitelist: ['beneficiaryForm', 'accountInfo', 'beneficiaries', 'accounts'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

