"use client";

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import ToponymDetailLayout from '@/components/v2/layout/ToponymDetailLayout';

// Mock Data for a single toponym detail
const DUMMY_TOPONYM_DETAIL = {
    id: 'top-1',
    element_id: 'BN1BGN118',
    specific_element: 'Semeru',
    map_name: 'Gunung Semeru',
    local_name: 'Semeru',
    generic_element: 'Gunung',
    language_origin: 'Jawa',
    name_meaning: 'Puncak Abadi Para Dewa',
    name_history: 'Ditemukan sejak zaman dahulu oleh penduduk lokal.',
    pronounciation: 'Se-me-ru',
    spelling: 'Semeru',
    location_point: {
        type: 'Point',
        coordinates: [112.922, -8.108]
    },
    elevation_value: '3676',
    province_id: '35',
    regency_id: '35.08',
    district_id: '35.08.01',
    village_id: '35.08.01.2001',
    created_at: '2026-05-01T08:00:00Z',
    element: {
        code: 'BN1BGN118',
        name: 'Gunung'
    },
    province: { name: 'JAWA TIMUR' },
    regency: { name: 'LUMAJANG' },
    district: { name: 'PASRUJAMBE' },
    village: { name: 'PASRUJAMBE' },
    photos: [],
    status: 'penelaahan'
};

const ToponymDetailPage = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params?.id as string;
    const transactionId = searchParams.get('transactionId');

    const [isUpdating, setIsUpdating] = useState(false);

    const handleApprove = () => {
        alert("Toponim (Dummy) disetujui!");
        router.back();
    };

    const handleReject = () => {
        alert("Toponim (Dummy) ditolak!");
        router.back();
    };

    const handleSubmit = async (data: any) => {
        setIsUpdating(true);
        console.log("Saving data:", data);
        setTimeout(() => {
            alert("Data (Dummy) berhasil disimpan!");
            setIsUpdating(false);
            router.back();
        }, 1000);
    };

    return (
        <DashboardLayout showNav={false} tightMargin={true}>
            <ToponymDetailLayout
                mode='detail'
                initialData={DUMMY_TOPONYM_DETAIL}
                isVerifikator={true}
                onSubmitAction={handleSubmit}
                onApproveAction={handleApprove}
                onRejectAction={handleReject}
                isSubmitting={isUpdating}
            />
        </DashboardLayout>
    );
};

export default ToponymDetailPage;
