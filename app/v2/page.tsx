"use client"
import React from 'react'
import PublicLayout from '@/components/v2/nav/PublicLayout'
import IndonesiaMap from '@/components/v2/map/IndonesiaMap'

const PetaPage = () => {
    return (
        <PublicLayout isMap={true}>
            <div className='flex-1 w-full h-full relative overflow-hidden'>
                <IndonesiaMap />
            </div>
        </PublicLayout>
    )
}

export default PetaPage