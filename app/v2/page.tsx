"use client"
import React, { Suspense } from 'react'
import PublicLayout from '@/components/v2/nav/PublicLayout'
import IndonesiaMap from '@/components/v2/map/IndonesiaMap'

const PetaPage = () => {
    return (
        <PublicLayout isMap={true}>
            <div className='flex-1 w-full h-full relative overflow-hidden'>
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-sm font-semibold text-gray-500 animate-pulse">Memuat Peta...</span>
                    </div>
                }>
                    <IndonesiaMap />
                </Suspense>
            </div>
        </PublicLayout>
    )
}

export default PetaPage