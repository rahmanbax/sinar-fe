"use client";

import React, { useState } from 'react';
import ToponymDetailLayout from '@/components/v2/layout/ToponymDetailLayout';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateToponym } from '@/hooks/useToponyms';
import { uploadImage, uploadAudio, uploadVideo, uploadDocs } from '@/api/media';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';

const TARGET_LEVELS = [
    { value: 0, label: 'Kabupaten / Kota', description: 'Diajukan langsung ke verifikator kab/kota' },
    { value: 3, label: 'Provinsi', description: 'Diajukan langsung ke verifikator provinsi' },
    { value: 6, label: 'Pusat', description: 'Diajukan langsung ke verifikator pusat' },
];

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
        return { type: 'LineString', coordinates: drawnLine.map((p) => [p.lng, p.lat]) };
    }
    if (drawType === 'Polygon' && drawnPolygon.length > 0 && drawnPolygon[0].length >= 3) {
        const rings = drawnPolygon
            .filter((ring) => ring.length >= 3)
            .map((ring) => {
                const coords = ring.map((p) => [p.lng, p.lat]);
                coords.push(coords[0]);
                return coords;
            });
        return { type: 'MultiPolygon', coordinates: [rings] };
    }
    return null;
};

const TambahDataContributorPage = () => {
    const router = useRouter();
    const { token } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [targetLevel, setTargetLevel] = useState<number>(0);
    const { mutateAsync: createToponym, isPending } = useCreateToponym();

    const handleSubmit = async (data: any) => {
        const geometry = buildGeometry(data._geometry);
        if (!geometry) {
            alert('Silakan gambar lokasi di peta terlebih dahulu.');
            return;
        }
        if (!data.elemenGenerik || !data.elemenSpesifik || !data.namaLokal || !data.jenisUnsur || !data.provinsi || !data.kabupatenKota || !data.kecamatan || !data.desaKelurahan || !data.tanggalSurvey) {
            alert('Silakan lengkapi semua kolom yang bertanda bintang (*).');
            return;
        }

        setIsUploading(true);
        try {
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

            const payload: Record<string, unknown> = {
                generic_element: data.elemenGenerik,
                specific_element: data.elemenSpesifik,
                map_name: data.namaRupabumi,
                local_name: data.namaLokal,
                geometry,
                target_level: targetLevel,
            };

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

            const res = await createToponym({ payload, token });
            setIsUploading(false);

            if (!res.error) {
                alert('Toponim berhasil disimpan!');
                router.push('/v2/contributor/data-saya');
            } else {
                alert(`Gagal menyimpan: ${res.message}`);
            }
        } catch (err) {
            setIsUploading(false);
            console.error('Submit error:', err);
            alert('Terjadi kesalahan saat menyimpan.');
        }
    };

    return (
        <DashboardLayout showNav={false} tightMargin={true}>
            {/* Target Level Picker */}
            <div className="px-4 pt-4 pb-2 max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                        Ajukan ke tingkat mana? <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {TARGET_LEVELS.map((level) => (
                            <button
                                key={level.value}
                                type="button"
                                onClick={() => setTargetLevel(level.value)}
                                className={`flex-1 text-left px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                                    targetLevel === level.value
                                        ? 'border-navy-500 bg-navy-50 text-navy-700'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <p className="font-semibold text-sm">{level.label}</p>
                                <p className="text-xs mt-0.5 opacity-75">{level.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <ToponymDetailLayout
                mode="add"
                onSubmitAction={handleSubmit}
                isSubmitting={isPending || isUploading}
                onCancelAction={() => router.push('/v2/contributor/data-saya')}
            />
        </DashboardLayout>
    );
};

export default TambahDataContributorPage;
