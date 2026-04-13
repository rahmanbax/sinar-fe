import { create } from 'zustand';

export interface BuatPenelaahanFormState {
  formData: {
    judulPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
  };
  setFieldValue: <K extends keyof BuatPenelaahanFormState['formData']>(field: K, value: BuatPenelaahanFormState['formData'][K]) => void;
  resetForm: () => void;
}

const initialFormState: BuatPenelaahanFormState['formData'] = {
  judulPenelaahan: '',
  tanggalPenelaahan: '',
  jenisUnsur: [],
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
