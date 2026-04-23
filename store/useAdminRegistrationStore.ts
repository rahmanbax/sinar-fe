import { create } from 'zustand';

interface AdminRegistrationState {
  instansi: string;
  provinsi: string;
  kabupaten: string;
  noTelepon: string;
  emailInstansi: string;
  nama: string;
  password: string;
  konfirmasiPassword: string;
  noSurat: string;
  suratPermohonan: File | null;
  userFile: File | null;
  noSuratRekomendasi: string;
  suratRekomendasi: File | null;
  isAdminBig: boolean;
  
  // Actions
  setInstansi: (val: string) => void;
  setProvinsi: (val: string) => void;
  setKabupaten: (val: string) => void;
  setNoTelepon: (val: string) => void;
  setEmailInstansi: (val: string) => void;
  setNama: (val: string) => void;
  setPassword: (val: string) => void;
  setKonfirmasiPassword: (val: string) => void;
  setNoSurat: (val: string) => void;
  setSuratPermohonan: (file: File | null) => void;
  setUserFile: (file: File | null) => void;
  setNoSuratRekomendasi: (val: string) => void;
  setSuratRekomendasi: (file: File | null) => void;
  setIsAdminBig: (val: boolean) => void;
  resetForm: () => void;
}

const initialState = {
  instansi: '',
  provinsi: '',
  kabupaten: '',
  noTelepon: '',
  emailInstansi: '',
  nama: '',
  password: '',
  konfirmasiPassword: '',
  noSurat: '',
  suratPermohonan: null,
  userFile: null,
  noSuratRekomendasi: '',
  suratRekomendasi: null,
  isAdminBig: false,
};

export const useAdminRegistrationStore = create<AdminRegistrationState>((set) => ({
  ...initialState,
  
  setInstansi: (val) => set({ instansi: val }),
  setProvinsi: (val) => set({ provinsi: val }),
  setKabupaten: (val) => set({ kabupaten: val }),
  setNoTelepon: (val) => set({ noTelepon: val }),
  setEmailInstansi: (val) => set({ emailInstansi: val }),
  setNama: (val) => set({ nama: val }),
  setPassword: (val) => set({ password: val }),
  setKonfirmasiPassword: (val) => set({ konfirmasiPassword: val }),
  setNoSurat: (val) => set({ noSurat: val }),
  setSuratPermohonan: (file) => set({ suratPermohonan: file }),
  setUserFile: (file) => set({ userFile: file }),
  setNoSuratRekomendasi: (val) => set({ noSuratRekomendasi: val }),
  setSuratRekomendasi: (file) => set({ suratRekomendasi: file }),
  setIsAdminBig: (val) => set({ isAdminBig: val }),
  resetForm: () => set(initialState),
}));
