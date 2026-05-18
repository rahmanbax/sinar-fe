'use client'

import React, { useState } from 'react'
import HorizontalBarChart from '@/components/v2/charts/HorizontalBarChart'
import BuatPenelaahanPusatForm from '@/components/v2/layout/BuatPenelaahanPusatForm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import { useBuatPenelaahanPusatStore } from '@/store/useBuatPenelaahanPusatStore'

const BuatPenelaahanPusatPage = () => {
  const router = useRouter()
  const { resetForm } = useBuatPenelaahanPusatStore()
  const [isPending, setIsPending] = useState(false)

  // Dummy Data for Chart (Candidates)
  const chartItems = [
    { name: 'Gunung', value: 450, max: 500 },
    { name: 'Sungai', value: 380, max: 500 },
    { name: 'Tanjung', value: 210, max: 500 },
    { name: 'Bukit', value: 150, max: 500 },
    { name: 'Danau', value: 90, max: 500 },
  ]

  const jenisUnsurOptions = [
    { label: 'Gunung', value: 'gunung' },
    { label: 'Sungai', value: 'sungai' },
    { label: 'Tanjung', value: 'tanjung' },
    { label: 'Bukit', value: 'bukit' },
    { label: 'Danau', value: 'danau' },
  ]

  const handleSubmit = (formData: {
    judulPenelaahan: string;
    tanggalPenelaahan: string;
    jenisUnsur: string[];
    adminVerifikator: string[];
  }) => {
    setIsPending(true)
    console.log("Creating Penelaahan Pusat:", formData)

    // Simulate API call
    setTimeout(() => {
      alert('Penelaahan Pusat berhasil dibuat (Dummy Mode)')
      resetForm()
      setIsPending(false)
      router.push('/v2/verifikator-pusat/data-penelaahan')
    }, 1500)
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
        <h1 className='text-2xl font-bold '>Buat Penelaahan Nasional</h1>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col justify-center'>
            <HorizontalBarChart
              title="Kandidat Jenis Unsur Nasional"
              items={chartItems}
              isLoading={false}
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
