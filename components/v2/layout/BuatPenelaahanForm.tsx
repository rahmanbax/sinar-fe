import React from 'react'
import TextInput from '../inputs/TextInput'
import CalendarInput from '../inputs/CalendarInput'
import MultiSelectDropdown from '../inputs/MultiSelectDropdown'
import ButtonComponent from '../buttons/ButtonComponent'
import { useBuatPenelaahanStore } from '@/store/useBuatPenelaahanStore'

interface Option {
  label: string;
  value: string;
}

interface BuatPenelaahanFormProps {
  jenisUnsurOptions?: Option[];
  onSubmit?: (data: { judulPenelaahan: string; tanggalAwalPenelaahan: string; tanggalPenelaahan: string; jenisUnsur: string[] }) => void;
  isSubmitting?: boolean;
}

const DEFAULT_JENIS_UNSUR_OPTIONS: Option[] = [
  { label: 'Gunung', value: 'gunung' },
  { label: 'Bukit', value: 'bukit' },
  { label: 'Stadion', value: 'stadion' },
  { label: 'Candi', value: 'candi' },
  { label: 'Laut', value: 'laut' },
]

const BuatPenelaahanForm = ({ jenisUnsurOptions, onSubmit, isSubmitting = false }: BuatPenelaahanFormProps) => {
  const { formData, setFieldValue } = useBuatPenelaahanStore()

  const options = jenisUnsurOptions ?? DEFAULT_JENIS_UNSUR_OPTIONS

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='w-full p-3 bg-white border border-gray-300 rounded-lg space-y-4'
    >
      <TextInput
        id="judul-penelaahan"
        label="Judul Penelaahan"
        value={formData.judulPenelaahan}
        onChange={(e) => setFieldValue('judulPenelaahan', e.target.value)}
        required
      />
      <CalendarInput
        id="tanggal-awal-penelaahan"
        label="Tanggal Awal Penelaahan"
        value={formData.tanggalAwalPenelaahan}
        onChange={(e) => setFieldValue('tanggalAwalPenelaahan', e.target.value)}
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
      <ButtonComponent
        label={isSubmitting ? 'Menyimpan...' : 'Buat Penelaahan'}
        type='submit'
        className='w-full'
        disabled={isSubmitting}
      />
    </form>
  )
}

export default BuatPenelaahanForm