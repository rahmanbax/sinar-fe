'use client'

import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart'
import BuatPenelaahanForm from '@/components/v2/layout/BuatPenelaahanForm'
import React from 'react'
import { useVerificationCandidates, useCreateVerificationTransaction } from '@/hooks/useVerification'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const BuatPenelaahanPage = () => {
  const { token } = useAuth()
  const router = useRouter()
  const { data: candidatesRes, isLoading } = useVerificationCandidates(token)
  const { mutate: createTransaction, isPending } = useCreateVerificationTransaction()

  const candidates = candidatesRes?.data ?? []
  const maxCount = candidates.reduce((acc, item) => Math.max(acc, item.count), 0) || 1

  const chartItems = candidates.map((item) => ({
    name: item.element_name,
    value: item.count,
    max: maxCount,
  }))

  const jenisUnsurOptions = candidates.map((item) => ({
    label: item.element_name,
    value: item.element_code,
  }))

  const handleSubmit = (formData: {
    judulPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
  }) => {
    const due_at = formData.tanggalPenelaahan
      ? `${formData.tanggalPenelaahan}`
      : ''

    createTransaction(
      {
        token,
        data: {
          title: formData.judulPenelaahan,
          elements: formData.jenisUnsur,
          due_at,
        },
      },
      {
        onSuccess: (res) => {
          if (!res.error) {
            router.push('/v2/verifikator-kota/data-penelaahan')
          } else {
            alert(`Gagal membuat penelaahan: ${res.message}`)
          }
        },
        onError: () => {
          alert('Terjadi kesalahan saat membuat penelaahan.')
        },
      },
    )
  }

  return (
    <DashboardLayout showNav={false}>
      <div className='mt-6 mx-5 lg:mx-auto max-w-7xl space-y-5'>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/v2/verifikator-kota" className="hover:text-navy-600 transition-colors">Dashboard</Link>
            <ChevronRight size={14} />
          <Link href="/v2/verifikator-kota/data-penelaahan" className="hover:text-navy-600 transition-colors">Data Penelaahan</Link>
            <ChevronRight size={14} />
          <span className="text-gray-900 font-semibold">Buat Penelaahan</span>
        </nav>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <div className='md:col-span-2'>
            <HorizontalBarChart
              title="Kandidat Jenis Unsur"
              items={chartItems}
              isLoading={isLoading}
            />
          </div>
          <BuatPenelaahanForm
            jenisUnsurOptions={jenisUnsurOptions}
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default BuatPenelaahanPage