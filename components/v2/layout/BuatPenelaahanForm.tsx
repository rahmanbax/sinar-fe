import React from 'react'
import TextInput from '../inputs/TextInput'
import CalendarInput from '../inputs/CalendarInput'
import MultiSelectDropdown from '../inputs/MultiSelectDropdown'
import ButtonComponent from '../buttons/ButtonComponent'
import { useAuth } from '@/contexts/AuthContext'
import { useMyTeams } from '@/hooks/usePersonal'
import { useForm, Controller } from 'react-hook-form'

interface Option {
  label: string;
  value: string;
}

interface FormValues {
  judulPenelaahan: string;
  tanggalAwalPenelaahan: string;
  tanggalPenelaahan: string;
  jenisUnsur: string[];
  participants: string[];
}

interface BuatPenelaahanFormProps {
  jenisUnsurOptions?: Option[];
  onSubmit?: (data: FormValues) => void;
  isSubmitting?: boolean;
}

const BuatPenelaahanForm = ({ jenisUnsurOptions, onSubmit, isSubmitting = false }: BuatPenelaahanFormProps) => {
  const { token } = useAuth()
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      judulPenelaahan: '',
      tanggalAwalPenelaahan: '',
      tanggalPenelaahan: '',
      jenisUnsur: [],
      participants: [],
    }
  })
  
  // Fetch verifier participants from /api/personal/my-teams?role=verificator
  const { data: teamsResponse } = useMyTeams(token, 1, "", "verificator")

  const options = jenisUnsurOptions ?? [];

  const verifikatorOptions = React.useMemo(() => {
    return (teamsResponse?.data || []).map((member: any) => ({
      label: `${member.name} - ${member.email}`,
      value: member.id,
    }))
  }, [teamsResponse])

  const handleFormSubmit = (data: FormValues) => {
    onSubmit?.(data)
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='w-full p-3 bg-white border border-gray-300 rounded-lg space-y-4'
    >
      <Controller
        name="judulPenelaahan"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <TextInput
            id="judul-penelaahan"
            label="Judul Penelaahan"
            value={field.value}
            onChange={field.onChange}
            required
          />
        )}
      />
      <Controller
        name="tanggalAwalPenelaahan"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <CalendarInput
            id="tanggal-awal-penelaahan"
            label="Tanggal Awal Penelaahan"
            value={field.value}
            onChange={field.onChange}
            required
          />
        )}
      />
      <Controller
        name="tanggalPenelaahan"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <CalendarInput
            id="tanggal-penelaahan"
            label="Tanggal Akhir Penelaahan"
            value={field.value}
            onChange={field.onChange}
            required
          />
        )}
      />
      <Controller
        name="jenisUnsur"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <MultiSelectDropdown
            label="Jenis Unsur"
            value={field.value}
            onChange={field.onChange}
            options={options}
            required
          />
        )}
      />
      <Controller
        name="participants"
        control={control}
        render={({ field }) => (
          <MultiSelectDropdown
            label="Partisipan Verifikator"
            value={field.value}
            onChange={field.onChange}
            options={verifikatorOptions}
          />
        )}
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