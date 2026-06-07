"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useSliderDetail, useUpdateSliderMutation } from "@/hooks/useCms";
import { uploadImage } from "@/api/media";

const EditSliderPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const { data: response, isLoading } = useSliderDetail(token, id);
    const slider = response?.data;

    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [order, setOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slider) {
            setTitle(slider.title ?? "");
            setLinkUrl(slider.link_url ?? "");
            setOrder(slider.order);
            setIsActive(slider.is_active);
            setImagePreview(slider.image_url);
        }
    }, [slider]);

    const updateMutation = useUpdateSliderMutation();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        let imageUrl = slider?.image_url ?? "";

        if (imageFile) {
            setUploading(true);
            try {
                const uploaded = await uploadImage(imageFile, token);
                if (uploaded.error) throw new Error(uploaded.message);
                imageUrl = uploaded.data.url;
            } catch {
                setError("Gagal mengunggah gambar.");
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        if (!imageUrl) return setError("Gambar slide wajib ada.");

        updateMutation.mutate(
            {
                token,
                id,
                data: {
                    title: title || undefined,
                    image_url: imageUrl,
                    link_url: linkUrl || undefined,
                    order,
                    is_active: isActive,
                },
            },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/slider"),
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

    if (!slider) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">Slide tidak ditemukan.</div>
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
                        <h1 className="text-2xl font-bold">Edit Slide</h1>
                        <p className="text-sm text-gray-500">{slider.title ?? "Tanpa judul"}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    {/* Gambar */}
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Gambar Slide</label>
                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={imagePreview}
                                    alt="preview"
                                    className="w-full max-h-64 object-cover"
                                />
                                <label
                                    htmlFor="image-change"
                                    className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 text-gray-800 text-xs font-medium rounded-lg cursor-pointer hover:bg-white transition-colors"
                                >
                                    Ganti gambar
                                    <input id="image-change" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                        ) : (
                            <label
                                htmlFor="image"
                                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-navy-400 transition-colors"
                            >
                                <Upload size={28} className="text-gray-400" />
                                <p className="text-sm text-gray-500">Klik untuk unggah gambar</p>
                                <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>

                    <TextInput
                        id="title"
                        label="Judul / Caption (opsional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Selamat Datang di SINAR"
                    />

                    <TextInput
                        id="link_url"
                        label="URL Tautan (opsional)"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                    />

                    <div className="flex gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">Urutan Tampil</label>
                            <input
                                type="number"
                                min={0}
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">Angka kecil tampil lebih awal</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-2">Status</label>
                            <select
                                value={isActive ? "1" : "0"}
                                onChange={(e) => setIsActive(e.target.value === "1")}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm"
                            >
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </select>
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

export default EditSliderPage;
