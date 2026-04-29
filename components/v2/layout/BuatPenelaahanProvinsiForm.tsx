import React from 'react'
import TextInput from '../inputs/TextInput'
import CalendarInput from '../inputs/CalendarInput'
import MultiSelectDropdown from '../inputs/MultiSelectDropdown'
import ButtonComponent from '../buttons/ButtonComponent'
import { useBuatPenelaahanProvinsiStore } from '@/store/useBuatPenelaahanProvinsiStore'

interface Option {
  label: string;
  value: string;
}

interface BuatPenelaahanProvinsiFormProps {
  jenisUnsurOptions?: Option[];
  onSubmit?: (data: { judulPenelaahan: string; tanggalPenelaahan: string; jenisUnsur: string[]; adminVerifikator: string[] }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const DEFAULT_JENIS_UNSUR_OPTIONS: Option[] = [
  { label: 'Gunung', value: 'gunung' },
  { label: 'Bukit', value: 'bukit' },
  { label: 'Stadion', value: 'stadion' },
  { label: 'Candi', value: 'candi' },
  { label: 'Laut', value: 'laut' },
]

const BuatPenelaahanProvinsiForm = ({ 
  jenisUnsurOptions, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: BuatPenelaahanProvinsiFormProps) => {
  const { formData, setFieldValue } = useBuatPenelaahanProvinsiStore()

  const options = jenisUnsurOptions ?? DEFAULT_JENIS_UNSUR_OPTIONS

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='w-full p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-5'
    >
      <TextInput
        id="judul-penelaahan"
        label="Judul Penelaahan"
        value={formData.judulPenelaahan}
        onChange={(e) => setFieldValue('judulPenelaahan', e.target.value)}
        required
      />
      <CalendarInput
        id="tanggal-penelaahan"
        label="Tanggal Akhir Penelaahan"
        value={formData.tanggalPenelaahan}
        onChange={(e) => setFieldValue('tanggalPenelaahan', e.target.value)}
        required
      />
      <MultiSelectDropdown
        label="Jenis Unsur"
        value={formData.jenisUnsur}
        onChange={(val) => setFieldValue('jenisUnsur', val)}
        options={options}
        required
      />

      <div className="flex gap-3 pt-2">
        <ButtonComponent
          label="Batalkan"
          type="button"
          secondary
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        />
        <ButtonComponent
          label={isSubmitting ? 'Menyimpan...' : 'Buat Penelaahan'}
          type='submit'
          className='flex-1'
          disabled={isSubmitting}
        />
      </div>
    </form>
  )
}

export default BuatPenelaahanProvinsiForm
