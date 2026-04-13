import { create } from 'zustand';

export interface BuatPenelaahanFormState {
  formData: {
    judulPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string;
  };
  setFieldValue: (field: keyof BuatPenelaahanFormState['formData'], value: string) => void;
  resetForm: () => void;
}

const initialFormState = {
  judulPenelaahan: '',
  tanggalPenelaahan: '',
  jenisUnsur: '',
};

export const useBuatPenelaahanStore = create<BuatPenelaahanFormState>((set) => ({
  formData: initialFormState,
  setFieldValue: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
  resetForm: () =>
    set(() => ({
      formData: initialFormState,
    })),
}));
