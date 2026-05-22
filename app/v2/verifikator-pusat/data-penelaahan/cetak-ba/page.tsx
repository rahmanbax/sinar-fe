"use client"

import React, { Suspense } from 'react'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'
import CetakBeritaAcaraForm from '@/components/v2/layout/CetakBeritaAcaraForm'
import { Loader2 } from 'lucide-react'

const CetakBaPusatPage = () => {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
                        <p className="text-gray-500 font-medium">Memuat halaman...</p>
                    </div>
                </div>
            }>
                <CetakBeritaAcaraForm
                    backPath="/v2/verifikator-pusat/data-penelaahan?tab=semua"
                    redirectAfterSubmit="/v2/verifikator-pusat/data-penelaahan?tab=semua"
                />
            </Suspense>
        </DashboardLayout>
    )
}

export default CetakBaPusatPage
