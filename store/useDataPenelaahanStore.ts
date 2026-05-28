import { create } from 'zustand';

export interface DataPenelaahanState {
  searchText: string;
  setSearchText: (text: string) => void;
  transactionPage: number;
  setTransactionPage: (page: number) => void;
  viewMode: 'card' | 'table';
  setViewMode: (mode: 'card' | 'table') => void;
  submittingTransactions: Record<string, boolean>;
  setSubmittingTransaction: (id: string, isSubmitting: boolean) => void;
  reset: () => void;
}

export const useDataPenelaahanStore = create<DataPenelaahanState>((set) => ({
  searchText: '',
  setSearchText: (text) => set({ searchText: text }),
  transactionPage: 1,
  setTransactionPage: (page) => set({ transactionPage: page }),
  viewMode: 'card',
  setViewMode: (mode) => set({ viewMode: mode }),
  submittingTransactions: {},
  setSubmittingTransaction: (id, isSubmitting) =>
    set((state) => ({
      submittingTransactions: {
        ...state.submittingTransactions,
        [id]: isSubmitting,
      },
    })),
  reset: () =>
    set({
      searchText: '',
      transactionPage: 1,
      viewMode: 'card',
      submittingTransactions: {},
    }),
}));
