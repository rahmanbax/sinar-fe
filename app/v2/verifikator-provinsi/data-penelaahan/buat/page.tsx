'use client'

import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart'
import BuatPenelaahanProvinsiForm from '@/components/v2/layout/BuatPenelaahanProvinsiForm'
import React from 'react'
import { useVerificationCandidates, useCreateVerificationTransaction } from '@/hooks/useVerification'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

import Link from 'next/link'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'

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
    tanggalPenelaahan: string;
    jenisUnsur: string[];
    adminVerifikator: string[];
  }) => {
    const due_at = formData.tanggalPenelaahan
      ? `${formData.tanggalPenelaahan}`
      : ''

    // Panggil API createTransaction
    createTransaction(
      {
        token,
        data: {
          title: formData.judulPenelaahan,
          elements: formData.jenisUnsur,
          due_at,
          // TODO: tambahkan field untuk mengirim adminVerifikator jika API-nya sudah siap
          // verificator_ids: formData.adminVerifikator
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

  const handleCancel = () => {
    router.push('/v2/verifikator-provinsi/data-penelaahan')
  }

  return (
    <DashboardLayout showNav={false}>
      <div className='mt-6 mx-5 lg:mx-auto max-w-7xl space-y-6 mb-12'>
        <p className='text-gray-400 font-medium text-sm'>
          Dashboard / <Link href="/v2/verifikator-provinsi/data-penelaahan" className="hover:text-navy-600 transition-colors">Data Penelaahan</Link> / <span className='text-navy-900'>Buat Penelaahan</span>
        </p>
        <h1 className='text-2xl font-bold text-navy-900'>Buat Penelaahan</h1>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col justify-center'>
            <HorizontalBarChart
              title="Kandidat Jenis Unsur"
              items={chartItems}
              isLoading={isLoading}
            />
          </div>
          <div className='flex flex-col'>
            <BuatPenelaahanProvinsiForm
              jenisUnsurOptions={jenisUnsurOptions}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isPending}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default BuatPenelaahanProvinsiPage
