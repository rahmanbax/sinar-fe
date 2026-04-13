"use client";
import React from 'react'
import { useParams } from 'next/navigation'
import ToponymDetailLayout from '@/components/v2/layout/ToponymDetailLayout'
import SurveyorLayout from '@/components/v2/nav/SurveyorLayout'
import { useSurveyToponymDetail } from '@/hooks/useToponyms'
import { useAuth } from '@/contexts/AuthContext'

const DetailDataPage = () => {
    const params = useParams();
    const id = params.id as string;
    const { token } = useAuth();
    const { data: response, isLoading, isError } = useSurveyToponymDetail(id, token);

    if (isLoading) {
        return (
            <SurveyorLayout showNav={false} tightMargin={true}>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-navy-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 font-medium">Memuat data...</p>
                    </div>
                </div>
            </SurveyorLayout>
        )
    }

    if (isError || !response?.data) {
        return (
            <SurveyorLayout showNav={false} tightMargin={true}>
                 <div className="flex items-center justify-center h-full">
                    <p className="text-red-500">Gagal memuat data toponim.</p>
                </div>
            </SurveyorLayout>
        )
    }

    return (
        <SurveyorLayout showNav={false} tightMargin={true}>
            <ToponymDetailLayout 
                mode='edit' 
                initialData={response.data} 
            />
        </SurveyorLayout>
    )
}

export default DetailDataPage
