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


        </div>
      </div>
    </PublicLayout>
  )
}

export default GazeterPage