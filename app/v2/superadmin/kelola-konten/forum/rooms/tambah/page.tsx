"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextInput from "@/components/v2/inputs/TextInput";
import TextBoxInput from "@/components/v2/inputs/TextBoxInput";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateRoomMutation } from "@/hooks/useForum";

const TambahRoomPage = () => {
    const router = useRouter();
    const { token } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [order, setOrder] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateRoomMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return setError("Nama room wajib diisi.");

        createMutation.mutate(
            { token, data: { title, description, order, is_active: true } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/forum"),
                onError: (err) => setError(err.message),
            }
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Tambah Room Forum</h1>
                        <p className="text-sm text-gray-500">Buat kategori/ruang diskusi baru</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    <TextInput id="title" label="Nama Room" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Contoh: Diskusi Umum Toponimi" />

                    <TextBoxInput id="description" label="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} required={false} />

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Urutan Tampil</label>
                        <input type="number" min={0} value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm" />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</button>
                        <ButtonComponent label={createMutation.isPending ? "Menyimpan..." : "Simpan"} disabled={createMutation.isPending} />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default TambahRoomPage;
