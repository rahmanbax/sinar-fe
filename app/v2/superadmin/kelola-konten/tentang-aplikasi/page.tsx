"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import TextInput from "@/components/v2/inputs/TextInput";
import RichTextEditor from "@/components/v2/inputs/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useAboutApp, useUpdateAboutAppMutation } from "@/hooks/useCms";

const TentangAplikasiPage = () => {
    const { token } = useAuth();
    const { data: response, isLoading, isError } = useAboutApp(token);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (response?.data) {
            setTitle(response.data.title ?? "");
            setContent(response.data.content ?? "");
        }
    }, [response]);

    const updateMutation = useUpdateAboutAppMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        updateMutation.mutate(
            { token, data: { title, content } },
            {
                onSuccess: () => setSuccess(true),
                onError: (err) => setError(err.message),
            }
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Tentang Aplikasi</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola informasi tentang aplikasi SINAR</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Memuat data...</div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-40 text-red-400 text-sm">
                        Gagal memuat data. Pastikan migration sudah dijalankan.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                        <TextInput
                            id="title"
                            label="Judul"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tentang Sistem Informasi Nama Rupabumi"
                        />

                        <RichTextEditor
                            label="Konten"
                            value={content}
                            onChange={setContent}
                            placeholder="Tuliskan deskripsi tentang aplikasi SINAR..."
                        />

                        {success && (
                            <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                                Data berhasil disimpan.
                            </p>
                        )}
                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 px-5 py-2.5 bg-navy-500 text-white text-sm font-semibold rounded-lg hover:bg-navy-600 disabled:opacity-60 transition-colors"
                            >
                                <Save size={16} />
                                {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TentangAplikasiPage;
