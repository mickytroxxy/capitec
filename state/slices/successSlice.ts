import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SuccessButton = {
  id: string;
  title: string;
  variant?: 'primary' | 'secondary';
  action: {
    type: 'navigate' | 'replace' | 'back' | 'custom';
    payload?: any;
  };
};

export type SuccessState = {
  isVisible: boolean;
  title: string;
  message: string;
  sub1?:string;
  cash1?:string;
  cash2?:string;
  subMessage?: string; // Optional second message
  buttons: SuccessButton[];
  paymentData?: any; // Store payment data for PDF generation
};

const initialState: SuccessState = {
  isVisible: false,
  title: 'Successful',
  message: '',
  subMessage: undefined,
  buttons: [],
  paymentData: undefined,
};

const successSlice = createSlice({
  name: 'success',
  initialState,
  reducers: {
    showSuccess: (state, action: PayloadAction<{
      title?: string;
      message: string;
      subMessage?: string;
      sub1?: string;
      cash1?: string;
      cash2?: string;
      buttons: SuccessButton[];
      paymentData?: any;
    }>) => {
      state.isVisible = true;
      state.title = action.payload.title || 'Successful';
      state.message = action.payload.message;
      state.subMessage = action.payload.subMessage;
      state.sub1 = action.payload.sub1;
      state.cash1 = action.payload.cash1;
      state.cash2 = action.payload.cash2;
      state.buttons = action.payload.buttons;
      state.paymentData = action.payload.paymentData;
    },
    hideSuccess: (state) => {
      state.isVisible = false;
      state.message = '';
      state.subMessage = undefined;
      state.buttons = [];
      state.paymentData = undefined;
    },
    resetSuccess: () => initialState,
  },
});

export const { showSuccess, hideSuccess, resetSuccess } = successSlice.actions;
export default successSlice.reducer;

// Predefined success configurations
export const successConfigs = {
  beneficiaryAdded: (beneficiaryName: string, account: string) => ({
    message: `${beneficiaryName} has been added to your beneficiaries.`,
    buttons: [
      {
        id: 'pay-now',
        title: 'Pay Now',
        variant: 'primary' as const,
        action: {
          type: 'replace' as const,
          payload: { pathname: '/payment-form', params: { account } },
        },
      },
      {
        id: 'done',
        title: 'Done',
        variant: 'secondary' as const,
        action: {
          type: 'replace' as const,
          payload: '/(tabs)/payments',
        },
      },
    ],
  }),

  paymentCompleted: (beneficiaryName: string, amount: string, paymentData?: any) => {
    const effectiveDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      message: `You have paid ${amount} to ${beneficiaryName}.`,
      subMessage: `Effective date: Today`,
      paymentData: paymentData,
      buttons: [
        {
          id: 'done',
          title: 'Done',
          variant: 'primary' as const,
          action: {
            type: 'replace' as const,
            payload: '/(tabs)',
          },
        },
        {
          id: 'send-notification',
          title: 'Share Payment Notification',
          variant: 'secondary' as const,
          action: {
            type: 'custom' as const,
            payload: 'send-notification',
          },
        }
      ],
    };
  },

  transferCompleted: (amount: string, accountType: string) => ({
    message: `Transfer of ${amount} to ${accountType} has been completed successfully.`,
    buttons: [
      {
        id: 'view-statement',
        title: 'View Statement',
        variant: 'primary' as const,
        action: {
          type: 'navigate' as const,
          payload: '/statement',
        },
      },
      {
        id: 'done',
        title: 'Done',
        variant: 'secondary' as const,
        action: {
          type: 'replace' as const,
          payload: '/(tabs)/home',
        },
      },
    ],
  }),
};
