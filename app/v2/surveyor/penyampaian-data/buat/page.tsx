import PenyampaianDataForm from '@/components/v2/layout/PenyampaianDataForm'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const BuatPenyampaianDataPage = () => {
    return (
        <DashboardLayout showNav={false}>
            <nav className="flex items-center text-sm text-gray-500 mb-5 gap-2 max-w-xl mx-auto">
                <Link href="/v2/surveyor" className="hover:text-black transition-colors">Dashboard</Link>
                <ChevronRight size={14} />
                <Link href="/v2/surveyor/penyampaian-data" className="hover:text-black transition-colors">Penyampaian Data</Link>
                <ChevronRight size={14} />
                <span className="text-black">Tambah Akun</span>
            </nav>
            <PenyampaianDataForm />
        </DashboardLayout>
    )
}

export default BuatPenyampaianDataPage