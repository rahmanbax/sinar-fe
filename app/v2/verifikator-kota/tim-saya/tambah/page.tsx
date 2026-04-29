import VerificatorAndSurveyorRegistrationForm from '@/components/v2/layout/VerificatorAndSurveyorRegistrationForm'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const TambahAkunTimPage = () => {
    return (
        <DashboardLayout showNav={false}>
            <nav className="flex items-center text-sm text-gray-500 mb-5 gap-2 max-w-xl mx-auto">
                <Link href="/v2/verifikator-kota" className="hover:text-black transition-colors">Dashboard</Link>
                <ChevronRight size={14} />
                <Link href="/v2/verifikator-kota/tim-saya" className="hover:text-black transition-colors">Tim Saya</Link>
                <ChevronRight size={14} />
                <span className="text-black">Tambah Akun Tim</span>
            </nav>
            <VerificatorAndSurveyorRegistrationForm />
        </DashboardLayout>
    )
}

export default TambahAkunTimPage