"use client"

import ButtonComponent from '@/components/v2/buttons/ButtonComponent'
import DropdownInput from '@/components/v2/inputs/DropdownInput'
import FileInput from '@/components/v2/inputs/FileInput'
import PasswordInput from '@/components/v2/inputs/PasswordInput'
import TextInput from '@/components/v2/inputs/TextInput'
import PublicLayout from '@/components/v2/nav/PublicLayout'
import React, { Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRegisterAdminMutation } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'

type AdminRegistrationFormData = {
  noTelepon: string;
  emailInstansi: string;
  nama: string;
  password: string;
  konfirmasiPassword: string;
  noSurat: string;
  suratPermohonan: File | null;
}

const DaftarAkunAdminForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { control, handleSubmit, watch, formState: { errors } } = useForm<AdminRegistrationFormData>({
    defaultValues: {
      noTelepon: '',
      emailInstansi: '',
      nama: '',
      password: '',
      konfirmasiPassword: '',
      noSurat: '',
      suratPermohonan: null,
    }
  });



  const { mutate: registerAdmin, isPending } = useRegisterAdminMutation({
    onSuccess: () => {
      alert('Pendaftaran admin berhasil dikirim, menunggu persetujuan dari Admin.');
      router.push('/v2');
    },
    onError: (err) => {
      alert(`Gagal mendaftar: ${err.message}`);
    }
  });

  const onSubmit = (data: AdminRegistrationFormData) => {
    if (data.password !== data.konfirmasiPassword) {
      alert('Konfirmasi kata sandi tidak cocok!');
      return;
    }
    if (!data.suratPermohonan) {
      alert('Mohon unggah surat permohonan!');
      return;
    }

    registerAdmin({
      name: data.nama,
      email: data.emailInstansi,
      phone: data.noTelepon,
      password: data.password,
      password_confirmation: data.konfirmasiPassword,
      recommendation_file: data.suratPermohonan,
      ref_number: data.noSurat,
      invite_token: token,
    });
  };

  return (
    <PublicLayout>
      <div className="h-full py-12 px-5 overflow-y-auto bg-gray-50">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-lg p-6 max-w-xl mx-auto space-y-5">
          <h1 className='text-xl font-semibold'>Daftar Akun Admin</h1>
          <div className='space-y-4'>

            <Controller
              name="noTelepon"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextInput
                  id='noTelepon'
                  label='No Telepon WhatsApp'
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />

            <Controller
              name="emailInstansi"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextInput
                  id='emailInstansi'
                  label='Email Instansi'
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />

            <Controller
              name="nama"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextInput
                  id='nama'
                  label='Nama'
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <PasswordInput
                  id='password'
                  label='Kata Sandi'
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />

            <Controller
              name="konfirmasiPassword"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <PasswordInput
                  id='konfirmasiPassword'
                  label='Konfirmasi Kata Sandi'
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />

            <Controller
              name="noSurat"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextInput
                  id='noSurat'
                  label='No. Surat'
                  onChange={field.onChange}
                  value={field.value}
                  required
                />
              )}
            />

            <Controller
              name="suratPermohonan"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FileInput
                  id='suratPermohonan'
                  label='Surat Permohonan'
                  onChange={(file) => field.onChange(file)}
                  required
                  accept='.pdf'
                  maxSizeMB={2}
                />
              )}
            />
          </div>
          <ButtonComponent
            label={isPending ? 'Mendaftar...' : 'Daftar Akun'}
            className='w-full'
            disabled={isPending}
            type='submit'
          />
        </form>
      </div>
    </PublicLayout>
  )
}

const DaftarAkunAdminPage = () => {
  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="h-full py-12 px-5 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">Memuat formulir...</p>
        </div>
      </PublicLayout>
    }>
      <DaftarAkunAdminForm />
    </Suspense>
  )
}

export default DaftarAkunAdminPage