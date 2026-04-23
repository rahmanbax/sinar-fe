'use client'

import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import DropdownInput from '@/components/v2/inputs/DropdownInput';
import FileInput from '@/components/v2/inputs/FileInput';
import PasswordInput from '@/components/v2/inputs/PasswordInput';
import TextInput from '@/components/v2/inputs/TextInput';
import AdminRegistrationForm from '@/components/v2/layout/AdminRegistrationForm';
import AdminLayout from '@/components/v2/nav/AdminLayout'
import React from 'react'

const dummyInstansiOptions = [
    { value: "admin_big", label: "Admin BIG" },
    { value: "admin_provinsi", label: "Admin Provinsi" },
    { value: "admin_kab_kota", label: "Admin Kabupaten/Kota" },
];

const realProvinsiOptions = [
    { value: "jakarta", label: "DKI Jakarta" },
    { value: "jawa_barat", label: "Jawa Barat" },
    { value: "jawa_tengah", label: "Jawa Tengah" },
    { value: "jawa_timur", label: "Jawa Timur" },
];

const realKabupatenOptions = [
    { value: "jakarta_pusat", label: "Jakarta Pusat" },
    { value: "jakarta_selatan", label: "Jakarta Selatan" },
    { value: "jakarta_timur", label: "Jakarta Timur" },
    { value: "jakarta_barat", label: "Jakarta Barat" },
    { value: "jakarta_utara", label: "Jakarta Utara" },
];

const TambahAkunPage = () => {
    return (
        <AdminLayout showNav={false}>
            <AdminRegistrationForm/>
        </AdminLayout>
    )
}

export default TambahAkunPage