"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/v2/nav/DashboardLayout";
import ButtonComponent from "@/components/v2/buttons/ButtonComponent";
import { useAuth } from "@/contexts/AuthContext";
import { useGalleryList, useDeleteGalleryMutation } from "@/hooks/useCms";

const GaleriPage = () => {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: response, isLoading } = useGalleryList(token, page, search);
    const deleteMutation = useDeleteGalleryMutation();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (id: string, title: string) => {
        if (!confirm(`Yakin ingin menghapus foto "${title}"?`)) return;
        setDeletingId(id);
        deleteMutation.mutate(
            { token, id },
            { onSettled: () => setDeletingId(null) }
        );
    };

    const pagination = response?.pagination;

    return (
        <DashboardLayout>
            <div className="mb-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Galeri</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola foto galeri aplikasi</p>
                    </div>
                    <Link href="/v2/superadmin/kelola-konten/galeri/tambah">
                        <ButtonComponent icon={<Plus size={16} />} label="Tambah Foto" />
                    </Link>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari foto..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-navy-500 text-white rounded-lg hover:bg-navy-600 transition-colors"
                    >
                        Cari
                    </button>
                </form>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : !response?.data?.length ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                        <span className="text-4xl">🖼️</span>
                        <p className="text-sm">Belum ada foto di galeri</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {response.data.map((item) => (
                            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                                <Image
                                    src={item.photo_url}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col justify-end p-3">
                                    <p className="text-white text-sm font-semibold line-clamp-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        {item.title}
                                    </p>
                                    <div className="flex gap-2 mt-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                                        <Link
                                            href={`/v2/superadmin/kelola-konten/galeri/${item.id}`}
                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/90 text-gray-800 text-xs font-medium rounded-lg hover:bg-white transition-colors"
                                        >
                                            <Pencil size={13} /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id, item.title)}
                                            disabled={deletingId === item.id}
                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/90 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                                        >
                                            <Trash2 size={13} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-gray-500">
                            {pagination.from}–{pagination.to} dari {pagination.total} foto
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-2 text-sm text-gray-600">
                                {page} / {pagination.last_page}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default GaleriPage;
