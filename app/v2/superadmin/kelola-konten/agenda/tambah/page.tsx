"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAgendaMutation } from "@/hooks/useCms";
import { uploadImage } from "@/api/media";

const TambahAgendaPage = () => {
    const router = useRouter();
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateAgendaMutation();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPhotoFile(file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) return setError("Judul wajib diisi.");
        if (!date) return setError("Tanggal wajib diisi.");

        let photoUrl: string | undefined;

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

        createMutation.mutate(
            { token, data: { title, date, photo_url: photoUrl } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/agenda"),
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
                        <h1 className="text-2xl font-bold">Tambah Agenda</h1>
                        <p className="text-sm text-gray-500">Tambah kegiatan agenda baru</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    <TextInput
                        id="title"
                        label="Judul Agenda"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Contoh: Rapat Koordinasi Nasional 2026"
                    />

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">
                            Tanggal <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                        />
                    </div>

                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Foto</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {photoPreview ? (
                                <div>
                                    <img
                                        src={photoPreview}
                                        alt="preview"
                                        className="w-full max-h-56 object-cover rounded-lg"
                                    />
                                    <div className="flex gap-3 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                            className="text-sm text-red-500 hover:underline"
                                        >
                                            Hapus foto
                                        </button>
                                        <label htmlFor="photo-change" className="text-sm text-navy-600 hover:underline cursor-pointer">
                                            Ganti foto
                                            <input id="photo-change" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label
                                    htmlFor="photo"
                                    className="flex flex-col items-center gap-2 cursor-pointer text-gray-500 hover:text-gray-700"
                                >
                                    <Upload size={24} />
                                    <span className="text-sm">Klik untuk unggah foto</span>
                                    <span className="text-xs text-gray-400">JPG, PNG, WEBP (Maks. 5MB)</span>
                                    <input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            )}
                        </div>
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
                            label={isSubmitting ? "Menyimpan..." : "Simpan"}
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default TambahAgendaPage;
