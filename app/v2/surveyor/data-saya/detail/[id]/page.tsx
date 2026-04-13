"use client";
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import ToponymDetailLayout from '@/components/v2/layout/ToponymDetailLayout'
import SurveyorLayout from '@/components/v2/nav/SurveyorLayout'
import { useSurveyToponymDetail, useUpdateToponym } from '@/hooks/useToponyms'
import { useAuth } from '@/contexts/AuthContext'
import { uploadImage, uploadAudio, uploadVideo, uploadDocs } from '@/api/media'

// Helper: build GeoJSON geometry from layout's _geometry snapshot
const buildGeometry = (geometry: {
    drawType: string;
    drawnPoint: { lat: number; lng: number } | null;
    drawnLine: { lat: number; lng: number }[];
    drawnPolygon: { lat: number; lng: number }[][];
}): { type: string; coordinates: any } | null => {
    const { drawType, drawnPoint, drawnLine, drawnPolygon } = geometry;

    if (drawType === 'Point' && drawnPoint) {
        return { type: 'Point', coordinates: [drawnPoint.lng, drawnPoint.lat] };
    }
    if (drawType === 'Line' && drawnLine.length >= 2) {
        return {
            type: 'LineString',
            coordinates: drawnLine.map((p) => [p.lng, p.lat]),
        };
    }
    if (drawType === 'Polygon' && drawnPolygon.length > 0 && drawnPolygon[0].length >= 3) {
        const rings = drawnPolygon
            .filter((ring) => ring.length >= 3)
            .map((ring) => {
                const coords = ring.map((p) => [p.lng, p.lat]);
                // Close the ring
                coords.push(coords[0]);
                return coords;
            });
        return { type: 'MultiPolygon', coordinates: [rings] };
    }
    return null;
};

const DetailDataPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { token } = useAuth();
    const { data: response, isLoading, isError } = useSurveyToponymDetail(id, token);
    const [isUploading, setIsUploading] = React.useState(false);
    const { mutateAsync: updateToponym, isPending } = useUpdateToponym();

    const handleSubmit = async (data: any) => {
        const geometry = buildGeometry(data._geometry);

        // Basic validation for required fields
        if (!data.elemenGenerik || !data.elemenSpesifik || !data.namaLokal || !data.jenisUnsur || !data.provinsi || !data.kabupatenKota || !data.kecamatan || !data.desaKelurahan || !data.tanggalSurvey) {
            alert('Silakan lengkapi semua kolom yang bertanda bintang (*).');
            return;
        }

        setIsUploading(true);
        try {
            // 1. Upload foto
            let uploadedPhotos: { url: string; filename: string }[] = [];
            if (data.foto instanceof File) {
                const res = await uploadImage(data.foto, token);
                if (!res.error && res.data) {
                    uploadedPhotos = [{ url: res.data.url, filename: res.data.filename }];
                }
            }

            // 2. Upload sketsa lokasi
            let sketchUrl: string | null = null;
            if (data.sketsaLokasi instanceof File) {
                const res = await uploadImage(data.sketsaLokasi, token);
                if (!res.error && res.data) sketchUrl = res.data.url;
            }

            // 3. Upload rekaman suara
            let audioUrl: string | null = null;
            if (data.rekamanSuaraPengucapan instanceof File) {
                const res = await uploadAudio(data.rekamanSuaraPengucapan, token);
                if (!res.error && res.data) audioUrl = res.data.url;
            }

            // 4. Upload rekaman audio visual
            let videoUrl: string | null = null;
            if (data.rekamanAudioVisual instanceof File) {
                const res = await uploadVideo(data.rekamanAudioVisual, token);
                if (!res.error && res.data) videoUrl = res.data.url;
            }

            // 5. Upload dokumen pendukung
            let docsUrl: string | null = null;
            if (data.dokumenPendukung instanceof File) {
                const res = await uploadDocs(data.dokumenPendukung, token);
                if (!res.error && res.data) docsUrl = res.data.url;
            }

            // 6. Build payload
            const payload: Record<string, unknown> = {
                generic_element: data.elemenGenerik,
                specific_element: data.elemenSpesifik,
                map_name: data.namaRupabumi,
                local_name: data.namaLokal,
            };

            // Geometry fields
            if (geometry) {
                if (geometry.type === 'Point') {
                    payload.location_point = geometry;
                } else if (geometry.type === 'LineString') {
                    payload.location_line = geometry;
                } else if (geometry.type === 'MultiPolygon') {
                    payload.location_area = geometry;
                }
                payload.geometry = geometry;
            }

            // Optional fields
            if (data.namaLain) payload.other_name = data.namaLain;
            if (data.asalBahasa) payload.language_origin = data.asalBahasa;
            if (data.artiNama) payload.name_meaning = data.artiNama;
            if (data.sejarahNama) payload.name_history = data.sejarahNama;
            if (data.pelafalan) payload.pronounciation = data.pelafalan;
            if (data.ejaan) payload.spelling = data.ejaan;
            if (data.jenisUnsur) payload.element_id = data.jenisUnsur;
            if (data.provinsi) payload.province_code = data.provinsi;
            if (data.kabupatenKota) payload.regency_code = data.kabupatenKota;
            if (data.kecamatan) payload.district_code = data.kecamatan;
            if (data.desaKelurahan) payload.village_code = data.desaKelurahan;
            if (data.tanggalSurvey) payload.survey_at = data.tanggalSurvey;
            if (uploadedPhotos.length > 0) payload.photos = uploadedPhotos;
            if (sketchUrl) payload.sketch = sketchUrl;
            if (audioUrl) payload.pronounciation_audio_url = audioUrl;
            if (videoUrl) payload.video_url = videoUrl;
            if (docsUrl) payload.support_document_url = docsUrl;

            // 7. Submit Update
            const res = await updateToponym({ id, payload, token });
            setIsUploading(false);

            if (!res.error) {
                alert('Toponim berhasil diubah!');
                router.push('/v2/surveyor/data-saya');
            } else {
                alert(`Gagal mengubah: ${res.message}`);
            }
        } catch (err) {
            setIsUploading(false);
            console.error('Submit error:', err);
            alert('Terjadi kesalahan saat mengubah.');
        }
    };

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
                onSubmitAction={handleSubmit}
                isSubmitting={isPending || isUploading}
            />
        </SurveyorLayout>
    )
}

export default DetailDataPage
