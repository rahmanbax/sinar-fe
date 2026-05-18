'use client'

import ToponymDetailLayout from '@/components/v2/layout/ToponymDetailLayout'
import { useToponymDetail } from '@/hooks/useToponyms'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAcceptVerificationToponym, useRejectVerificationToponym, useUpdateVerificationToponym } from '@/hooks/useVerification'
import { uploadImage, uploadAudio, uploadVideo, uploadDocs } from '@/api/media'
import React, { useState } from 'react'
import DashboardLayout from '@/components/v2/nav/DashboardLayout'

const buildGeometry = (geometry: any) => {
    const { drawType, drawnPoint, drawnLine, drawnPolygon } = geometry;

    if (drawType === 'Point' && drawnPoint) {
        return { type: 'Point', coordinates: [drawnPoint.lng, drawnPoint.lat] };
    }
    if (drawType === 'Line' && drawnLine.length >= 2) {
        return {
            type: 'LineString',
            coordinates: drawnLine.map((p: any) => [p.lng, p.lat]),
        };
    }
    if (drawType === 'Polygon' && drawnPolygon.length > 0 && drawnPolygon[0].length >= 3) {
        const rings = drawnPolygon
            .filter((ring: any) => ring.length >= 3)
            .map((ring: any) => {
                const coords = ring.map((p: any) => [p.lng, p.lat]);
                // Close the ring
                coords.push(coords[0]);
                return coords;
            });
        return { type: 'MultiPolygon', coordinates: [rings] };
    }
    return null;
};

const ToponymDetailPage = () => {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { token } = useAuth()
    
    const id = params?.id as string
    const transactionId = searchParams.get('transactionId')

    const { data: toponymRes, isLoading } = useToponymDetail(id)
    const toponymData = toponymRes?.data

    const { mutate: acceptMutate } = useAcceptVerificationToponym()
    const { mutate: rejectMutate } = useRejectVerificationToponym()
    const { mutate: updateMutate, isPending: isUpdating } = useUpdateVerificationToponym()

    const isReviewedParam = searchParams.get('reviewed') === 'true';

    const isAlreadyReviewed = 
        isReviewedParam ||
        toponymData?.status?.toLowerCase() === 'disetujui' || 
        toponymData?.status?.toLowerCase() === 'ditolak';


    const handleApprove = () => {
        if (!transactionId || !id) return
        acceptMutate(
            { token, transactionId, toponymId: id },
            { 
                onSuccess: (res) => {
                    if (!res.error) {
                        alert('Toponim berhasil disetujui!');
                        router.push('/v2/verifikator-kota/data-penelaahan');
                    } else {
                        alert(res.message || 'Gagal menyetujui toponim');
                    }
                },
                onError: () => alert('Terjadi kesalahan koneksi saat menyetujui toponim')
            }
        )
    }

    const handleReject = () => {
        if (!transactionId || !id) return
        rejectMutate(
            { token, transactionId, toponymId: id },
            {
                onSuccess: (res) => {
                    if (!res.error) {
                        alert('Toponim berhasil ditolak!');
                        router.push('/v2/verifikator-kota/data-penelaahan');
                    } else {
                        alert(res.message || 'Gagal menolak toponim');
                    }
                },
                onError: () => alert('Terjadi kesalahan koneksi saat menolak toponim')
            }
        )
    }

    const handleSubmit = async (data: any) => {
        if (!transactionId || !id) return
        
        try {
            // Upload files if they are File objects
            let uploadedPhotos: { url: string; filename: string }[] = [];
            if (data.foto instanceof File) {
                const res = await uploadImage(data.foto, token);
                if (!res.error && res.data) uploadedPhotos = [{ url: res.data.url, filename: res.data.filename }];
            }

            let sketchUrl: string | null = null;
            if (data.sketsaLokasi instanceof File) {
                const res = await uploadImage(data.sketsaLokasi, token);
                if (!res.error && res.data) sketchUrl = res.data.url;
            }

            let audioUrl: string | null = null;
            if (data.rekamanSuaraPengucapan instanceof File) {
                const res = await uploadAudio(data.rekamanSuaraPengucapan, token);
                if (!res.error && res.data) audioUrl = res.data.url;
            }

            let videoUrl: string | null = null;
            if (data.rekamanAudioVisual instanceof File) {
                const res = await uploadVideo(data.rekamanAudioVisual, token);
                if (!res.error && res.data) videoUrl = res.data.url;
            }

            let docsUrl: string | null = null;
            if (data.dokumenPendukung instanceof File) {
                const res = await uploadDocs(data.dokumenPendukung, token);
                if (!res.error && res.data) docsUrl = res.data.url;
            }

            // Build payload
            const payload: Record<string, unknown> = {
                generic_element: data.elemenGenerik,
                specific_element: data.elemenSpesifik,
                map_name: data.namaRupabumi,
                local_name: data.namaLokal,
                other_name: data.namaLain,
                language_origin: data.asalBahasa,
                name_meaning: data.artiNama,
                name_history: data.sejarahNama,
                pronounciation: data.pelafalan,
                spelling: data.ejaan,
                element_id: data.jenisUnsur,
                province_code: data.provinsi,
                regency_code: data.kabupatenKota,
                district_code: data.kecamatan,
                village_code: data.desaKelurahan,
                survey_at: data.tanggalSurvey,
            };

            const geometry = buildGeometry(data._geometry);
            if (geometry) {
                if (geometry.type === 'Point') payload.location_point = geometry;
                else if (geometry.type === 'LineString') payload.location_line = geometry;
                else if (geometry.type === 'MultiPolygon') payload.location_area = geometry;
                payload.geometry = geometry;
            }

            if (uploadedPhotos.length > 0) payload.photos = uploadedPhotos;
            if (sketchUrl) payload.sketch = sketchUrl;
            if (audioUrl) payload.pronounciation_audio_url = audioUrl;
            if (videoUrl) payload.video_url = videoUrl;
            if (docsUrl) payload.support_document_url = docsUrl;

            updateMutate(
                { token, transactionId, toponymId: id, payload },
                {
                    onSuccess: (res) => {
                        if (!res.error) {
                            alert('Data berhasil disimpan!');
                            router.push('/v2/verifikator-kota/data-penelaahan');
                        } else {
                            alert(`Gagal menyimpan: ${res.message}`);
                        }
                    },
                    onError: () => alert('Terjadi kesalahan saat menyimpan data.')
                }
            )
        } catch (error) {
            console.error(error);
            alert('Gagal menyusun data topnomi.');
        }
    }

    return (
        <DashboardLayout showNav={false} tightMargin={true}>
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-500">Memuat data toponim...</p>
                </div>
            ) : (
                <ToponymDetailLayout
                    mode='detail'
                    initialData={toponymData}
                    isVerifikator={!isAlreadyReviewed}
                    onSubmitAction={handleSubmit}
                    onApproveAction={handleApprove}
                    onRejectAction={handleReject}
                    isSubmitting={isUpdating}
                />
            )}
        </DashboardLayout>
    )
}

export default ToponymDetailPage