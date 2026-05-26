import { create } from 'zustand';

export interface BuatPenelaahanFormState {
  formData: {
    judulPenelaahan: string;
    tanggalAwalPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
    participants: string[];
  };
  setFieldValue: <K extends keyof BuatPenelaahanFormState['formData']>(field: K, value: BuatPenelaahanFormState['formData'][K]) => void;
  resetForm: () => void;
}

const initialFormState: BuatPenelaahanFormState['formData'] = {
  judulPenelaahan: '',
  tanggalAwalPenelaahan: '',
  tanggalPenelaahan: '',
  jenisUnsur: [],
  participants: [],
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
