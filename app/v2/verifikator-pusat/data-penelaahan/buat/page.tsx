'use client'

import React from 'react'
import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart'
import BuatPenelaahanPusatForm from '@/components/v2/layout/BuatPenelaahanPusatForm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import { useBuatPenelaahanPusatStore } from '@/store/useBuatPenelaahanPusatStore'
import { useAuth } from '@/contexts/AuthContext'
import { useVerificationCandidates, useCreateVerificationTransaction } from '@/hooks/useVerification'

const BuatPenelaahanPusatPage = () => {
  const router = useRouter()
  const { token } = useAuth()
  const { resetForm } = useBuatPenelaahanPusatStore()

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
    tanggalAwalPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
    adminVerifikator: string[];
  }) => {
    const due_at = formData.tanggalPenelaahan ? `${formData.tanggalPenelaahan} 23:59:59.99` : ''
    const issued_at = formData.tanggalAwalPenelaahan ? `${formData.tanggalAwalPenelaahan} 00:00:00.00` : ''

    createTransaction(
      {
        token,
        data: {
          title: formData.judulPenelaahan,
          elements: formData.jenisUnsur,
          due_at,
          issued_at,
          participants: formData.adminVerifikator,
        },
      },
      {
        onSuccess: (res) => {
          if (!res.error) {
            resetForm()
            router.push('/v2/verifikator-pusat/data-penelaahan')
          } else {
            alert(`Gagal membuat penelaahan: ${res.message}`)
          }
        },
        onError: () => {
          alert('Terjadi kesalahan saat membuat penelaahan.')
        },
      }
    )
  }

  const handleCancel = () => {
    router.push('/v2/verifikator-pusat/data-penelaahan')
  }

  return (
    <DashboardLayout showNav={false}>
      <div className='mt-6 mx-5 lg:mx-auto max-w-7xl space-y-6 mb-12'>
        <p className='text-gray-400 font-medium text-sm'>
          <Link href='/v2/verifikator-pusat' className="hover:text-navy-600 transition-colors">Dashboard</Link> / <Link href="/v2/verifikator-pusat/data-penelaahan" className="hover:text-navy-600 transition-colors">Data Penelaahan</Link> / <span className=''>Buat Penelaahan</span>
        </p>
        <h1 className='text-2xl font-bold '>Buat Penelaahan</h1>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-2'>
            <HorizontalBarChart
              title="Kandidat Jenis Unsur"
              items={chartItems}
              isLoading={isLoading}
            />
          </div>
          <div className='flex flex-col'>
            <BuatPenelaahanPusatForm
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

export default BuatPenelaahanPusatPage
