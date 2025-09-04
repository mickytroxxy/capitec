import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NextAction = {
  slice: 'accounts';
  reducer: 'setToggle';
  payload: any;
};

export type ConfirmDialogState = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  nextAction?: NextAction | null;
};

const initialState: ConfirmDialogState = {
  visible: false,
  title: '',
  message: undefined,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  nextAction: null,
};

const confirmSlice = createSlice({
  name: 'confirmDialog',
  initialState,
  reducers: {
    setConfirmDialog: (state, action: PayloadAction<Partial<ConfirmDialogState>>) => {
      state.visible = true;
      state.title = action.payload.title || '';
      state.message = action.payload.message;
      state.confirmText = action.payload.confirmText || 'Confirm';
      state.cancelText = action.payload.cancelText || 'Cancel';
      state.nextAction = action.payload.nextAction as any;
    },
    hideConfirmDialog: (state) => {
      state.visible = false;
      state.title = '';
      state.message = undefined;
      state.nextAction = null;
    },
    resetConfirmDialog: () => initialState,
  },
});

export const { setConfirmDialog, hideConfirmDialog, resetConfirmDialog } = confirmSlice.actions;
export default confirmSlice.reducer;

