'use client'

import AdminRegistrationForm from '@/components/v2/layout/AdminRegistrationForm';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const TambahAkunPage = () => {
    return (
        <DashboardLayout showNav={false}>
            <nav className="flex items-center text-sm text-gray-500 mb-5 gap-2 max-w-xl mx-auto">
                <Link href="/v2/admin" className="hover:text-black transition-colors">Dashboard</Link>
                <ChevronRight size={14} />
                <Link href="/v2/admin/akun" className="hover:text-black transition-colors">Akun</Link>
                <ChevronRight size={14} />
                <span className="text-black">Tambah Akun</span>
            </nav>
            <AdminRegistrationForm />
        </DashboardLayout>
    )
}

export default TambahAkunPage