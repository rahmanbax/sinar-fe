import AccordionComponent from '@/components/v2/accordion/AccordionComponent'
import GazeterCard from '@/components/v2/card/GazeterCard'
import PublicLayout from '@/components/v2/nav/PublicLayout'
import React from 'react'

const GazeterPage = () => {
  return (
    <PublicLayout>
      <div className="h-full py-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Gazeter Republik Indonesia</h1>
            <p className="text-gray-500 max-w-xl mx-auto">Direktori geografis resmi yang memuat profil, letak koordinat, dan rekam jejak historis seluruh entitas rupabumi yang telah dibakukan di Indonesia.</p>
          </div>

          <AccordionComponent title="Gazeter Republik Indonesia 2024">
            <div className='grid grid-cols-2 md:grid-cols-4'>
              <GazeterCard src="/gazeter-cover.png" altName="GRI Edisi 2 Tahun 2025" title="GRI Edisi 2 Tahun 2025" />
              <GazeterCard src="/gazeter-cover.png" altName="GRI Edisi 1 Tahun 2025" title="GRI Edisi 1 Tahun 2025" />
            </div>
          </AccordionComponent>


        </div>
      </div>
    </PublicLayout>
  )
}

export default GazeterPage