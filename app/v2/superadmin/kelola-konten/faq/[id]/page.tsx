"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import TextBoxInput from "@/components/v2/inputs/TextBoxInput";
import RichTextEditor from "@/components/v2/inputs/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useFaqDetail, useUpdateFaqMutation } from "@/hooks/useCms";

const EditFaqPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const { data: response, isLoading } = useFaqDetail(token, id);
    const faq = response?.data;

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [order, setOrder] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (faq) {
            setQuestion(faq.question);
            setAnswer(faq.answer);
            setOrder(faq.order);
        }
    }, [faq]);

    const updateMutation = useUpdateFaqMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!question.trim()) return setError("Pertanyaan wajib diisi.");
        if (!answer || answer === "<p></p>") return setError("Jawaban wajib diisi.");

        updateMutation.mutate(
            { token, id, data: { question, answer, order } },
            {
                onSuccess: () => router.push("/v2/superadmin/kelola-konten/faq"),
                onError: (err) => setError(err.message),
            }
        );
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">Memuat data...</div>
            </DashboardLayout>
        );
    }

    if (!faq) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">FAQ tidak ditemukan.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit FAQ</h1>
                        <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">{faq.question}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-5">
                    <TextBoxInput
                        id="question"
                        label="Pertanyaan"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />

                    <RichTextEditor
                        label="Jawaban"
                        value={answer}
                        onChange={setAnswer}
                        required
                        placeholder="Tulis jawaban di sini..."
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
                        <p className="text-xs text-gray-400 mt-1">Angka kecil ditampilkan lebih atas</p>
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
                            label={updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                            disabled={updateMutation.isPending}
                        />
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditFaqPage;
