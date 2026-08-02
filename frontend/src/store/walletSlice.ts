import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PartnerContribution {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  income: number;
  expense: number;
  contribution_percentage: number;
}

export interface WalletSummary {
  year: number;
  month: number;
  opening_balance: number;
  total_income: number;
  total_expense: number;
  closing_balance: number;
  savings: number;
  savings_rate: number;
  average_daily_expense: number;
  partner_contributions: PartnerContribution[];
  status: string;
}

export interface TransactionItem {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  category?: string;
  source?: string;
  description?: string;
  transaction_date: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface WalletState {
  selectedYear: number;
  selectedMonth: number;
  summary: WalletSummary | null;
  incomes: TransactionItem[];
  expenses: TransactionItem[];
  analytics: any | null;
  isLoading: boolean;
  error: string | null;
}

const currentDate = new Date();

const initialState: WalletState = {
  selectedYear: currentDate.getFullYear(),
  selectedMonth: currentDate.getMonth() + 1,
  summary: null,
  incomes: [],
  expenses: [],
  analytics: null,
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<number>) => {
      state.selectedMonth = action.payload;
    },
    setSelectedPeriod: (state, action: PayloadAction<{ year: number; month: number }>) => {
      state.selectedYear = action.payload.year;
      state.selectedMonth = action.payload.month;
    },
    setSummary: (state, action: PayloadAction<WalletSummary>) => {
      state.summary = action.payload;
    },
    setIncomes: (state, action: PayloadAction<TransactionItem[]>) => {
      state.incomes = action.payload;
    },
    setExpenses: (state, action: PayloadAction<TransactionItem[]>) => {
      state.expenses = action.payload;
    },
    setAnalytics: (state, action: PayloadAction<any>) => {
      state.analytics = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSelectedYear,
  setSelectedMonth,
  setSelectedPeriod,
  setSummary,
  setIncomes,
  setExpenses,
  setAnalytics,
  setLoading,
  setError,
} = walletSlice.actions;

export default walletSlice.reducer;
