"use client"

import ButtonComponent from '@/components/v2/buttons/ButtonComponent'
import DropdownInput from '@/components/v2/inputs/DropdownInput'
import FileInput from '@/components/v2/inputs/FileInput'
import PasswordInput from '@/components/v2/inputs/PasswordInput'
import TextInput from '@/components/v2/inputs/TextInput'
import PublicLayout from '@/components/v2/nav/PublicLayout'
import React, { useState, useMemo } from 'react'
import { useProvinces, useCities } from '@/hooks/useRegions'

const dummyInstansiOptions = [
  { label: 'Admin BIG', value: 'admin_big' },
  { label: 'Admin K/L', value: 'admin_kl' },
  { label: 'Admin Provinsi', value: 'admin_provinsi' },
  { label: 'Admin Kab/ Kota', value: 'admin_kab_kota' },
];

const dummyKabupatenOptions = [
  { label: 'Kota Bandung', value: 'kota_bandung' },
  { label: 'Kabupaten Bogor', value: 'kab_bogor' },
  { label: 'Kota Surabaya', value: 'kota_surabaya' },
  { label: 'Kota Semarang', value: 'kota_semarang' },
  { label: 'Kota Administrasi Jakarta Selatan', value: 'jaksel' },
];

const DaftarAkunAdminPage = () => {
  const [instansi, setInstansi] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [emailInstansi, setEmailInstansi] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kabupaten, setKabupaten] = useState("");
  const [noSurat, setNoSurat] = useState("");

  const { data: provincesData } = useProvinces();

  const realProvinsiOptions = useMemo(() => {
    return (provincesData?.data || []).map((prov) => ({
      label: prov.name,
      value: prov.code,
      path: prov.path,
    }));
  }, [provincesData]);

  const selectedProvincePath = useMemo(() => {
    if (!provinsi) return null;
    return realProvinsiOptions.find((p) => p.value === provinsi)?.path ?? null;
  }, [provinsi, realProvinsiOptions]);

  const { data: citiesData } = useCities(selectedProvincePath);

  const realKabupatenOptions = useMemo(() => {
    return (citiesData?.data || []).map((city) => ({
      label: city.name,
      value: city.code,
    }));
  }, [citiesData]);

  return (
    <PublicLayout>
      <div className="h-full py-12 px-5 overflow-y-auto bg-gray-50">
        <div className="bg-white shadow-sm rounded-lg p-6 max-w-xl mx-auto space-y-5">
          <h1 className='text-xl font-semibold'>Daftar Akun Admin</h1>
          <div className='space-y-4'>
            <DropdownInput
              label='Instansi'
              placeholder='Pilih Instansi'
              onChange={(val) => {
                  setInstansi(val);
                  // Reset child fields when parent changes
                  // setProvinsi("");
                  // setKabupaten("");
              }}
              value={instansi}
              options={dummyInstansiOptions}
              required
            // searchable={true} 
            />
            {/* Conditional Dropdown: Provinsi */}
            {/* {(instansi === 'admin_provinsi' || instansi === 'admin_kab_kota') && (
              <DropdownInput
                label='Provinsi'
                placeholder='Pilih Provinsi'
                onChange={(val) => {
                    setProvinsi(val);
                    setKabupaten("");
                }}
                value={provinsi}
                options={realProvinsiOptions}
                searchable={true}
                required
              />
            )} */}
            {/* Conditional Dropdown: Kabupaten/Kota */}
            {/* {instansi === 'admin_kab_kota' && (
              <DropdownInput
                label='Kabupaten/ Kota'
                placeholder='Pilih Kabupaten/ Kota'
                onChange={(val) => setKabupaten(val)}
                value={kabupaten}
                options={realKabupatenOptions}
                searchable={true}
                required
              />
            )} */}
            <TextInput
              id='noTelepon'
              label='No Telepon WhatsApp'
              onChange={(e) => setNoTelepon(e.target.value)}
              value={noTelepon}
              required
            />
            {/* email instansi */}
            <TextInput
              id='emailInstansi'
              label='Email Instansi'
              onChange={(e) => setEmailInstansi(e.target.value)}
              value={emailInstansi}
              required
            />
            {/* nama */}
            <TextInput
              id='nama'
              label='Nama'
              onChange={(e) => setNama(e.target.value)}
              value={nama}
              required
            />
            {/* kata sandi */}
            <PasswordInput
              id='password'
              label='Kata Sandi'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            {/* konfirmasi kata sandi */}
            <PasswordInput
              id='konfirmasiPassword'
              label='Konfirmasi Kata Sandi'
              onChange={(e) => setKonfirmasiPassword(e.target.value)}
              value={konfirmasiPassword}
              required
            />
            {/* no surat */}
            <TextInput
              id='noSurat'
              label='No. Surat'
              onChange={(e) => setNoSurat(e.target.value)}
              value={noSurat}
              required
            />
            {/* file input pdf */}
            <FileInput
              id='suratPermohonan'
              label='Surat Permohonan'
              onChange={(file) => console.log(file)}
              required
              accept='.pdf'
              maxSizeMB={2}
            />
          </div>
          <ButtonComponent
            label='Daftar Akun'
            onClick={() => console.log('daftar')}
            className='w-full'
          />
        </div>
      </div>
    </PublicLayout>
  )
}

export default DaftarAkunAdminPage