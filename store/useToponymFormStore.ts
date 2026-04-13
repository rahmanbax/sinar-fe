import { create } from 'zustand';

export interface ToponymFormState {
  formData: {
    elemenGenerik: string;
    elemenSpesifik: string;
    namaRupabumi: string;
    namaLokal: string;
    namaLain: string;
    asalBahasa: string;
    artiNama: string;
    sejarahNama: string;
    pelafalan: string;
    ejaan: string;
    jenisUnsur: string;
    provinsi: string;
    kabupatenKota: string;
    kecamatan: string;
    desaKelurahan: string;
    tanggalSurvey: string;
    // File objects (new upload)
    foto: File | null;
    sketsaLokasi: File | null;
    rekamanSuaraPengucapan: File | null;
    rekamanAudioVisual: File | null;
    dokumenPendukung: File | null;
    // Existing URLs from API (edit/detail mode)
    fotoUrl: string | null;
    sketsaLokasiUrl: string | null;
    rekamanSuaraPengucapanUrl: string | null;
    rekamanAudioVisualUrl: string | null;
    dokumenPendukungUrl: string | null;
  };
  setFieldValue: (field: string, value: any) => void;
  setAllFormData: (data: Partial<ToponymFormState['formData']>) => void;
  resetForm: () => void;
}

const initialFormState = {
  elemenGenerik: '',
  elemenSpesifik: '',
  namaRupabumi: '',
  namaLokal: '',
  namaLain: '',
  asalBahasa: '',
  artiNama: '',
  sejarahNama: '',
  pelafalan: '',
  ejaan: '',
  jenisUnsur: '',
  provinsi: '',
  kabupatenKota: '',
  kecamatan: '',
  desaKelurahan: '',
  tanggalSurvey: '',
  foto: null,
  sketsaLokasi: null,
  rekamanSuaraPengucapan: null,
  rekamanAudioVisual: null,
  dokumenPendukung: null,
  fotoUrl: null,
  sketsaLokasiUrl: null,
  rekamanSuaraPengucapanUrl: null,
  rekamanAudioVisualUrl: null,
  dokumenPendukungUrl: null,
};

export const useToponymFormStore = create<ToponymFormState>((set) => ({
  formData: initialFormState,
  setFieldValue: (field, value) => 
    set((state) => ({
      formData: { ...state.formData, [field]: value }
    })),
  setAllFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data }
    })),
  resetForm: () => 
    set(() => ({
      formData: initialFormState
    })),
}));
