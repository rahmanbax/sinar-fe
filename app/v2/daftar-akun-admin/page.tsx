"use client"

import ButtonComponent from '@/components/v2/buttons/ButtonComponent'
import DropdownInput from '@/components/v2/inputs/DropdownInput'
import FileInput from '@/components/v2/inputs/FileInput'
import PasswordInput from '@/components/v2/inputs/PasswordInput'
import TextInput from '@/components/v2/inputs/TextInput'
import PublicLayout from '@/components/v2/nav/PublicLayout'
import React, { useMemo } from 'react'
import { useProvinces, useCities } from '@/hooks/useRegions'
import { useOrganizations } from '@/hooks/useAdmin'
import { useForm, Controller } from 'react-hook-form'
import { useRegisterAdminMutation } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

type AdminRegistrationFormData = {
  instansi: string;
  noTelepon: string;
  emailInstansi: string;
  nama: string;
  password: string;
  konfirmasiPassword: string;
  noSurat: string;
  suratPermohonan: File | null;
}

const DaftarAkunAdminPage = () => {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm<AdminRegistrationFormData>({
    defaultValues: {
      instansi: '',
      noTelepon: '',
      emailInstansi: '',
      nama: '',
      password: '',
      konfirmasiPassword: '',
      noSurat: '',
      suratPermohonan: null,
    }
  });

  const { data: organizationResponse } = useOrganizations();

  const realInstansiOptions = useMemo(() => {
    if (!organizationResponse?.data) return [];
    return organizationResponse.data.map((org: any) => ({
      label: org.name,
      value: org.id,
    }));
  }, [organizationResponse]);

  // const selectedProvincePath = useMemo(() => {
  //   if (!provinsi) return null;
  //   return realProvinsiOptions.find((p) => p.value === provinsi)?.path ?? null;
  // }, [provinsi, realProvinsiOptions]);

  // const { data: citiesData } = useCities();

  // const realKabupatenOptions = useMemo(() => {
  //   return (citiesData?.data || []).map((city) => ({
  //     label: city.name,
  //     value: city.code,
  //   }));
  // }, [citiesData]);

  const { mutate: registerAdmin, isPending } = useRegisterAdminMutation({
    onSuccess: () => {
      alert('Pendaftaran admin berhasil dikirim dan menunggu persetujuan.');
      router.push('/');
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
      institution_type: 'admin_kabkota', // hard code
      org_id: data.instansi,
      name: data.nama,
      email: data.emailInstansi,
      phone: data.noTelepon,
      password: data.password,
      password_confirmation: data.konfirmasiPassword,
      recommendation_file: data.suratPermohonan,
      ref_number: data.noSurat,
    });
  };

  return (
    <PublicLayout>
      <div className="h-full py-12 px-5 overflow-y-auto bg-gray-50">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-lg p-6 max-w-xl mx-auto space-y-5">
          <h1 className='text-xl font-semibold'>Daftar Akun Admin</h1>
          <div className='space-y-4'>
            <Controller
              name="instansi"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <DropdownInput
                  label='Instansi'
                  placeholder='Pilih Instansi'
                  onChange={field.onChange}
                  value={field.value}
                  options={realInstansiOptions}
                  required
                />
              )}
            />

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
            onClick={handleSubmit(onSubmit)}
            className='w-full'
            disabled={isPending}
          />
        </form>
      </div>
    </PublicLayout>
  )
}

export default DaftarAkunAdminPage