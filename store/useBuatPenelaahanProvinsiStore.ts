import { create } from 'zustand';

export interface BuatPenelaahanProvinsiFormState {
  formData: {
    judulPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
    adminVerifikator: string[];
  };
  setFieldValue: <K extends keyof BuatPenelaahanProvinsiFormState['formData']>(field: K, value: BuatPenelaahanProvinsiFormState['formData'][K]) => void;
  resetForm: () => void;
}

const initialFormState: BuatPenelaahanProvinsiFormState['formData'] = {
  judulPenelaahan: '',
  tanggalPenelaahan: '',
  jenisUnsur: [],
  adminVerifikator: [],
};

export const useBuatPenelaahanProvinsiStore = create<BuatPenelaahanProvinsiFormState>((set) => ({
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
