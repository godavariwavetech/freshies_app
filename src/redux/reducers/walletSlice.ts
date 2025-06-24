import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  user_wallet_amount: string;
  user_used_amount: string;
  user_balance_amount: string;
  abhi24_wallet_amount: string;
  abhi24_used_amount: string;
  abhi24_balanced_amount: string;
  total_amount: string;
}

const initialState: WalletState = {
  user_wallet_amount: '0',
  user_used_amount: '0',
  user_balance_amount: '0',
  abhi24_wallet_amount: '0',
  abhi24_used_amount: '0',
  abhi24_balanced_amount: '0',
  total_amount: '0',
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletData(state, action: PayloadAction<WalletState>) {
      return { ...state, ...action.payload };
    },
    resetWallet(state) {
      return { ...initialState };
    },
  },
});

export const { setWalletData, resetWallet } = walletSlice.actions;
export default walletSlice.reducer;
