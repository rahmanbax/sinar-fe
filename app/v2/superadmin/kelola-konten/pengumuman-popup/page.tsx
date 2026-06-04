"use client";

import React, { useState, useEffect } from "react";
import { Save, Upload, X } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import TextInput from "@/components/v2/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { usePopupAnnouncement, useUpdatePopupAnnouncementMutation } from "@/hooks/useCms";
import { uploadImage } from "@/api/media";

const PengumumanPopupPage = () => {
    const { token } = useAuth();
    const { data: response, isLoading, isError } = usePopupAnnouncement(token);

    const [title, setTitle] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (response?.data) {
            setTitle(response.data.title ?? "");
            setIsActive(response.data.is_active);
            setPhotoPreview(response.data.photo_url ?? null);
        }
    }, [response]);

    const updateMutation = useUpdatePopupAnnouncementMutation();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPhotoFile(file);
        if (file) setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        let photoUrl = response?.data?.photo_url ?? undefined;

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

        updateMutation.mutate(
            { token, data: { title, photo_url: photoUrl, is_active: isActive } },
            {
                onSuccess: () => setSuccess(true),
                onError: (err) => setError(err.message),
            }
        );
    };

    const isSubmitting = uploading || updateMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Pengumuman Popup</h1>
                    <p className="text-sm text-gray-500 mt-1">Popup yang muncul di beranda saat pengguna membuka website</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Memuat data...</div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-40 text-red-400 text-sm">
                        Gagal memuat data. Pastikan migration sudah dijalankan.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-6">

                        {/* Toggle aktif */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                                <p className="text-sm font-semibold text-black">Status Popup</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {isActive ? "Popup aktif — ditampilkan di beranda" : "Popup nonaktif — tidak ditampilkan"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsActive(!isActive)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isActive ? "bg-navy-500" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? "translate-x-6" : "translate-x-0"}`}
                                />
                            </button>
                        </div>

                        <TextInput
                            id="title"
                            label="Judul Popup"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Masukkan judul pengumuman"
                        />

                        {/* Foto */}
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">Foto</label>
                            {photoPreview ? (
                                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                    <img
                                        src={photoPreview}
                                        alt="preview"
                                        className="w-full max-h-72 object-contain bg-gray-50"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <label
                                            htmlFor="photo-change"
                                            className="px-3 py-1.5 bg-white/90 text-gray-800 text-xs font-medium rounded-lg cursor-pointer hover:bg-white transition-colors"
                                        >
                                            Ganti
                                            <input id="photo-change" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                            className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
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

                        {success && (
                            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                                Data popup berhasil disimpan.
                            </p>
                        )}
                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-navy-500 text-white text-sm font-semibold rounded-lg hover:bg-navy-600 disabled:opacity-60 transition-colors"
                            >
                                <Save size={16} />
                                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PengumumanPopupPage;
