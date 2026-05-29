'use client'

import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart'
import { useVerificationCandidates, useCreateVerificationTransaction } from '@/hooks/useVerification'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import React from 'react'

import Link from 'next/link'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import BuatPenelaahanForm from '@/components/v2/layout/BuatPenelaahanForm'
import { ChevronRight } from 'lucide-react'

const BuatPenelaahanProvinsiPage = () => {
  const { token } = useAuth()
  const router = useRouter()

  // Use existing hooks
  const { data: candidatesRes, isLoading } = useVerificationCandidates(token)

  const { mutate: createTransaction, isPending } = useCreateVerificationTransaction()

  // Parse Candidates
  const candidates = candidatesRes?.data ?? []
  const maxCount = candidates.reduce((acc: number, item: any) => Math.max(acc, item.count), 0) || 1

  const chartItems = candidates.map((item: any) => ({
    name: item.element_name,
    value: item.count,
    max: maxCount,
  }))

  const jenisUnsurOptions = candidates.map((item: any) => ({
    label: item.element_name,
    value: item.element_code,
  }))

  // Nanti bisa diganti dengan fetch dari API jika dibutuhkan lagi

  const handleSubmit = (formData: {
    judulPenelaahan: string;
    tanggalAwalPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
    participants?: string[];
  }) => {
    const issued_at = formData.tanggalAwalPenelaahan
      ? `${formData.tanggalAwalPenelaahan} 00:00:00.00`
      : ''
    const due_at = formData.tanggalPenelaahan
      ? `${formData.tanggalPenelaahan} 23:59:59.00`
      : ''

    // Panggil API createTransaction
    createTransaction(
      {
        token,
        data: {
          title: formData.judulPenelaahan,
          elements: formData.jenisUnsur,
          issued_at,
          due_at,
          participants: formData.participants,
        },
      },
      {
        onSuccess: (res) => {
          if (!res.error) {
            alert('Penelaahan berhasil dibuat')
            router.push('/v2/verifikator-provinsi/data-penelaahan')
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
        <nav className="flex items-center text-sm text-gray-500 gap-2" >
          <Link href="/v2/verifikator-provinsi" className="hover:text-black transition-colors">Dashboard</Link> / 
          <Link href="/v2/verifikator-provinsi/data-penelaahan" className="hover:text-black transition-colors">Data Penelaahan</Link> / 
          <span className="text-black">Buat Penelaahan</span>
        </nav>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <div className='md:col-span-2'>
            <HorizontalBarChart
              title="Kandidat Jenis Unsur"
              items={chartItems}
              isLoading={isLoading}
            />
          </div>
          <div className='flex flex-col'>
            <BuatPenelaahanForm
              jenisUnsurOptions={jenisUnsurOptions}
              onSubmit={handleSubmit}
              isSubmitting={isPending}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default BuatPenelaahanProvinsiPage
