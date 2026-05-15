import { create } from 'zustand';

export interface BuatPenelaahanPusatFormState {
  formData: {
    judulPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
    adminVerifikator: string[];
  };
  setFieldValue: <K extends keyof BuatPenelaahanPusatFormState['formData']>(field: K, value: BuatPenelaahanPusatFormState['formData'][K]) => void;
  resetForm: () => void;
}

const initialFormState: BuatPenelaahanPusatFormState['formData'] = {
  judulPenelaahan: '',
  tanggalPenelaahan: '',
  jenisUnsur: [],
  adminVerifikator: [],
};

export const useBuatPenelaahanPusatStore = create<BuatPenelaahanPusatFormState>((set) => ({
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
