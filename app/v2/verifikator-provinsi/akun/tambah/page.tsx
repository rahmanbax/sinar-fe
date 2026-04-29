'use client'

import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import VerificatorAndSurveyorRegistrationForm from '@/components/v2/layout/VerificatorAndSurveyorRegistrationForm'
import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const TambahAkunPage = () => {
  return (
    <DashboardLayout showNav={false}>
      <nav className="flex items-center text-sm text-gray-500 mb-5 gap-2 max-w-xl mx-auto">
        <Link href="/v2/verifikator-provinsi" className="hover:text-black transition-colors">Dashboard</Link>
        <ChevronRight size={14} />
        <Link href="/v2/verifikator-provinsi/tim-saya" className="hover:text-black transition-colors">Tim Saya</Link>
        <ChevronRight size={14} />
        <span className="text-black">Tambah Akun Tim</span>
      </nav>
      <VerificatorAndSurveyorRegistrationForm />
    </DashboardLayout>
  )
}

export default TambahAkunPage