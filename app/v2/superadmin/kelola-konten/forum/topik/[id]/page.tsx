"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Send, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
    useAdminTopic, useDeleteTopicMutation,
    useAdminReplyMutation, useDeleteReplyMutation,
} from "@/hooks/useForum";
import { ForumReply } from "@/api/forum";

const formatDate = (d: string) =>
    new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const DetailTopikPage = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const { data: response, isLoading } = useAdminTopic(token, id);
    const topic = response?.data;

    const [replyContent, setReplyContent] = useState("");

    const deleteMutation = useDeleteTopicMutation();
    const replyMutation = useAdminReplyMutation();
    const deleteReplyMutation = useDeleteReplyMutation();

    const handleDeleteTopic = () => {
        if (!confirm("Yakin hapus topik ini beserta semua reply-nya?")) return;
        deleteMutation.mutate(
            { token, id },
            { onSuccess: () => router.push("/v2/superadmin/kelola-konten/forum/topik") }
        );
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        replyMutation.mutate(
            { token, topicId: id, content: replyContent },
            { onSuccess: () => setReplyContent("") }
        );
    };

    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64 text-gray-400">Memuat...</div></DashboardLayout>;
    if (!topic) return <DashboardLayout><div className="flex items-center justify-center h-64 text-gray-400">Topik tidak ditemukan.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-start gap-3 mb-6">
                    <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mt-0.5">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold">{topic.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {topic.room?.title} · {topic.author_name} · {formatDate(topic.created_at)}
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteTopic}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
                    >
                        <Trash2 size={15} /> Hapus Topik
                    </button>
                </div>

                {/* Konten topik */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{topic.content}</p>
                    {topic.author_email && <p className="text-xs text-gray-400 mt-3">{topic.author_email}</p>}
                </div>

                {/* Replies */}
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-500 mb-3">{topic.replies?.length ?? 0} BALASAN</h2>
                    <div className="flex flex-col gap-3">
                        {topic.replies?.map((reply: ForumReply) => (
                            <div key={reply.id} className={`rounded-xl border p-4 ${reply.is_admin_reply ? "bg-navy-50 border-navy-200" : "bg-white border-gray-100"}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-sm font-semibold">{reply.author_name}</span>
                                            {reply.is_admin_reply && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-navy-100 text-navy-700 text-xs font-semibold rounded-full">
                                                    <ShieldCheck size={11} /> Admin
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                    </div>
                                    <button
                                        onClick={() => { if (confirm("Hapus reply ini?")) deleteReplyMutation.mutate({ token, id: reply.id }); }}
                                        title="Hapus"
                                    >
                                        <Trash2 size={16} className="text-gray-400 hover:text-red-500 transition-colors shrink-0" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admin reply form */}
                <div className="bg-white rounded-xl border border-navy-200 p-5">
                    <p className="text-sm font-semibold text-navy-600 mb-3 flex items-center gap-1.5">
                        <ShieldCheck size={16} /> Balas sebagai Admin
                    </p>
                    <form onSubmit={handleSendReply} className="flex flex-col gap-3">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Tulis balasan..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300 text-sm resize-none"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={replyMutation.isPending || !replyContent.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white text-sm font-semibold rounded-lg hover:bg-navy-600 disabled:opacity-60 transition-colors"
                            >
                                <Send size={15} />
                                {replyMutation.isPending ? "Mengirim..." : "Kirim Balasan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DetailTopikPage;
