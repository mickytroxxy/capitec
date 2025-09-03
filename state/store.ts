import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import ExpoFileSystemStorage from 'redux-persist-expo-filesystem';
import beneficiaryForm from './slices/beneficiaryFormSlice';
import accountInfo from './slices/accountInfo';
import beneficiaries from './slices/beneficiaries';
import success from './slices/successSlice';
import payments from './slices/payments';
const rootReducer = combineReducers({
  beneficiaryForm,
  accountInfo,
  beneficiaries,
  success,
  payments
});

const persistConfig = {
  key: 'root',
  storage: ExpoFileSystemStorage,
  whitelist: ['beneficiaryForm', 'accountInfo', 'beneficiaries'],
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

