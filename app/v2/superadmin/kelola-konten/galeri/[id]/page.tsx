"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useGalleryDetail, useUpdateGalleryMutation } from "@/hooks/useCms";
import { uploadImage } from "@/api/media";

const EditGaleriPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const { data: response, isLoading } = useGalleryDetail(token, id);
    const gallery = response?.data;

    const [title, setTitle] = useState("");
    const [order, setOrder] = useState(0);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (gallery) {
            setTitle(gallery.title);
            setOrder(gallery.order);
            setPhotoPreview(gallery.photo_url);
        }
    }, [gallery]);

    const updateMutation = useUpdateGalleryMutation();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPhotoFile(file);
        if (file) setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError("Keterangan foto wajib diisi.");

        let photoUrl = gallery?.photo_url ?? "";

        if (photoFile) {
            setUploading(true);
            try {
                const uploaded = await uploadImage(photoFile, token);
                if (uploaded.error) throw new Error(uploaded.message);
                photoUrl = uploaded.data.url;
            } catch {
                setError("Gagal mengunggah foto.");
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        if (!photoUrl) return setError("Foto wajib ada.");

        updateMutation.mutate(
            { token, id, data: { title, photo_url: photoUrl, order } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/galeri"),
                onError: (err) => setError(err.message),
            }
        );
    };

    const isSubmitting = uploading || updateMutation.isPending;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">Memuat data...</div>
            </DashboardLayout>
        );
    }

    if (!gallery) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">Foto tidak ditemukan.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Foto Galeri</h1>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{gallery.title}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Foto</label>
                        {photoPreview ? (
                            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={photoPreview}
                                    alt="preview"
                                    className="w-full max-h-72 object-cover"
                                />
                                <label
                                    htmlFor="photo-change"
                                    className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 text-gray-800 text-xs font-medium rounded-lg cursor-pointer hover:bg-white transition-colors"
                                >
                                    Ganti foto
                                    <input id="photo-change" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            </div>
                        ) : (
                            <label
                                htmlFor="photo"
                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-navy-400 transition-colors"
                            >
                                <Upload size={28} className="text-gray-400" />
                                <p className="text-sm text-gray-500">Klik untuk unggah foto</p>
                                <input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        )}
                    </div>

                    <TextInput
                        id="title"
                        label="Keterangan Foto"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Masukkan keterangan foto"
                    />

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Urutan Tampil</label>
                        <input
                            type="number"
                            min={0}
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Angka kecil ditampilkan lebih awal</p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <ButtonComponent
                            type="submit"
                            label={isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditGaleriPage;
