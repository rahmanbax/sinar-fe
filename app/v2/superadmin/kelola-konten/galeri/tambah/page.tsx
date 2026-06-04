"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateGalleryMutation } from "@/hooks/useCms";
import { uploadImage } from "@/api/media";

const TambahGaleriPage = () => {
    const router = useRouter();
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [order, setOrder] = useState(0);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateGalleryMutation();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPhotoFile(file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError("Judul wajib diisi.");
        if (!photoFile) return setError("Foto wajib diunggah.");

        setUploading(true);
        let photoUrl: string;
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

        createMutation.mutate(
            { token, data: { title, photo_url: photoUrl, order } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/galeri"),
                onError: (err) => setError(err.message),
            }
        );
    };

    const isSubmitting = uploading || createMutation.isPending;

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
                        <h1 className="text-2xl font-bold">Tambah Foto Galeri</h1>
                        <p className="text-sm text-gray-500">Unggah foto baru ke galeri</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    {/* Upload foto */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Foto <span className="text-red-600">*</span>
                        </label>
                        {photoPreview ? (
                            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={photoPreview}
                                    alt="preview"
                                    className="w-full max-h-72 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X size={16} />
                                </button>
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
                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-navy-400 hover:bg-navy-50/30 transition-colors"
                            >
                                <Upload size={28} className="text-gray-400" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600">Klik untuk unggah foto</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Maks. 5MB)</p>
                                </div>
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
                            label={isSubmitting ? "Mengunggah..." : "Simpan"}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default TambahGaleriPage;
