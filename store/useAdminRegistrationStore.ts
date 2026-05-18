import { create } from 'zustand';

interface AdminRegistrationState {
  instansi: string;
  orgId: string;
  orgName: string;
  regionCode: string;
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

  setInstansi: (val: string) => void;
  setOrgId: (val: string) => void;
  setOrgName: (val: string) => void;
  setRegionCode: (val: string) => void;
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
  resetForm: () => void;
}

const initialState = {
  instansi: '',
  orgId: '',
  orgName: '',
  regionCode: '',
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
};

export const useAdminRegistrationStore = create<AdminRegistrationState>((set) => ({
  ...initialState,

  setInstansi: (val) => set({ instansi: val }),
  setOrgId: (val) => set({ orgId: val }),
  setOrgName: (val) => set({ orgName: val }),
  setRegionCode: (val) => set({ regionCode: val }),
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
  resetForm: () => set(initialState),
}));
