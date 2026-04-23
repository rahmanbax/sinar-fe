'use client'

import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import DropdownInput from '@/components/v2/inputs/DropdownInput';
import FileInput from '@/components/v2/inputs/FileInput';
import PasswordInput from '@/components/v2/inputs/PasswordInput';
import TextInput from '@/components/v2/inputs/TextInput';
import AdminRegistrationForm from '@/components/v2/layout/AdminRegistrationForm';
import AdminLayout from '@/components/v2/nav/AdminLayout'
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
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
            <nav className="flex items-center text-sm text-gray-500 mb-5 gap-2 max-w-xl mx-auto">
                <Link href="/v2/admin" className="hover:text-black transition-colors">Dashboard</Link>
                <ChevronRight size={14} />
                <Link href="/v2/admin/akun" className="hover:text-black transition-colors">Akun</Link>
                <ChevronRight size={14} />
                <span className="text-black">Tambah Akun</span>
            </nav>
            <AdminRegistrationForm />
        </AdminLayout>
    )
}

export default TambahAkunPage