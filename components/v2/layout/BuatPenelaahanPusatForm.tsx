import React from 'react'
import TextInput from '../inputs/TextInput'
import CalendarInput from '../inputs/CalendarInput'
import MultiSelectDropdown from '../inputs/MultiSelectDropdown'
import ButtonComponent from '../buttons/ButtonComponent'
import { useBuatPenelaahanPusatStore } from '@/store/useBuatPenelaahanPusatStore'
import { useAuth } from '@/contexts/AuthContext'
import { useMyTeams } from '@/hooks/usePersonal'

interface Option {
  label: string;
  value: string;
}

interface BuatPenelaahanPusatFormProps {
  jenisUnsurOptions?: Option[];
  onSubmit?: (data: { judulPenelaahan: string; tanggalAwalPenelaahan: string; tanggalPenelaahan: string; jenisUnsur: string[]; adminVerifikator: string[] }) => void;
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

const BuatPenelaahanPusatForm = ({ 
  jenisUnsurOptions, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: BuatPenelaahanPusatFormProps) => {
  const { formData, setFieldValue } = useBuatPenelaahanPusatStore()
  const { token } = useAuth()

  const { data: teamsResponse } = useMyTeams(token, 1, "", "verificator")

  const options = jenisUnsurOptions ?? DEFAULT_JENIS_UNSUR_OPTIONS

  const verifikatorOptions = React.useMemo(() => {
    return (teamsResponse?.data || []).map((member: any) => ({
      label: `${member.name} - ${member.email}`,
      value: member.id,
    }))
  }, [teamsResponse])

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
      <MultiSelectDropdown
        label="Partisipan Verifikator"
        value={formData.adminVerifikator}
        onChange={(val) => setFieldValue('adminVerifikator', val)}
        options={verifikatorOptions}
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

export default BuatPenelaahanPusatForm
