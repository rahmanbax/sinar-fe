"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgList, useCreateOrgNodeMutation } from "@/hooks/useCms";
import { uploadImage } from "@/api/media";

const TambahStrukturPage = () => {
    const router = useRouter();
    const { token } = useAuth();

    const { data: listResponse } = useOrgList(token);
    const allNodes = listResponse?.data ?? [];

    const [name, setName] = useState("");
    const [position, setPosition] = useState("");
    const [parentId, setParentId] = useState("");
    const [order, setOrder] = useState(0);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateOrgNodeMutation();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setPhotoFile(file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) return setError("Nama wajib diisi.");
        if (!position.trim()) return setError("Jabatan wajib diisi.");

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
            {
                token,
                data: {
                    name,
                    position,
                    photo_url: photoUrl,
                    parent_id: parentId || undefined,
                    order,
                },
            },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/struktur-kelembagaan"),
                onError: (err) => setError(err.message),
            }
        );
    };

    const isSubmitting = uploading || createMutation.isPending;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Anggota</h1>
                        <p className="text-sm text-gray-500">Tambah node baru ke struktur kelembagaan</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Foto</label>
                        {photoPreview ? (
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                    <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="photo-change" className="text-sm text-navy-600 hover:underline cursor-pointer">
                                        Ganti foto
                                        <input id="photo-change" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                    <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="text-sm text-red-500 hover:underline text-left">
                                        Hapus foto
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="photo" className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-navy-400 transition-colors w-fit">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Upload size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Upload foto profil</p>
                                    <p className="text-xs text-gray-400">JPG, PNG (Maks. 5MB)</p>
                                </div>
                                <input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        )}
                    </div>

                    <TextInput id="name" label="Nama" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama lengkap" />

                    <TextInput id="position" label="Jabatan" value={position} onChange={(e) => setPosition(e.target.value)} required placeholder="Contoh: Kepala Bidang Toponimi" />

                    {/* Parent */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Atasan (Parent)</label>
                        <select
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                        >
                            <option value="">— Tidak ada (root) —</option>
                            {allNodes.map((node) => (
                                <option key={node.id} value={node.id}>
                                    {node.name} — {node.position}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Urutan</label>
                        <input
                            type="number"
                            min={0}
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">Urutan antar saudara (sibling) pada level yang sama</p>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Batal
                        </button>
                        <ButtonComponent type="submit" label={isSubmitting ? "Menyimpan..." : "Simpan"} disabled={isSubmitting} />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default TambahStrukturPage;
