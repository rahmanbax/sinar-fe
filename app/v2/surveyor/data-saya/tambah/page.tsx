"use client"

import ToponymDetailLayout from '@/components/v2/layout/ToponymDetailLayout'
import SurveyorLayout from '@/components/v2/nav/SurveyorLayout'
import React from 'react'

const TambahDataPage = () => {
  return (
    <SurveyorLayout showNav={false} tightMargin={true}>
        <ToponymDetailLayout />
    </SurveyorLayout>
  )
}

export default TambahDataPage