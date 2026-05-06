"use client";

import React, { useState } from 'react';
import TextInput from '@/components/v2/inputs/TextInput';
import ButtonComponent from '@/components/v2/buttons/ButtonComponent';
import { FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminUser, useRejectRegistrationMutation, useApproveRegistrationMutation, useUpdateAdminStatusMutation } from '@/hooks/useAdmin';
import RejectionModal from '@/components/v2/modals/RejectionModal';
import DashboardLayout from '@/components/v2/nav/DashboardLayout';
import FileInput from '@/components/v2/inputs/FileInput';


const DetailAkunPage = () => {
    const params = useParams();
    const id = params.id as string;
    const { token } = useAuth();
    const { data: userResponse, refetch } = useAdminUser(token, id);
    const userData = userResponse?.data;
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const router = useRouter();

    const { mutate: rejectRegistration, isPending: isRejecting } = useRejectRegistrationMutation({
        onSuccess: () => {
            alert('Berhasil menolak pendaftaran!');
            router.push('/v2/superadmin/akun');
        },
        onError: (err) => {
            alert(`Gagal menolak pendaftaran: ${err.message}`);
        }
    });

    const { mutate: approveRegistration, isPending: isApproving } = useApproveRegistrationMutation({
        onSuccess: () => {
            alert('Berhasil menyetujui pendaftaran!');
            refetch();
        },
        onError: (err) => {
            alert(`Gagal menyetujui pendaftaran: ${err.message}`);
        }
    });

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateAdminStatusMutation({
        onSuccess: () => {
            alert('Status akun berhasil diperbarui!');
            refetch();
        },
        onError: (err) => {
            alert(`Gagal memperbarui status: ${err.message}`);
        }
    });

    const handleApprove = () => {
        if (window.confirm('Apakah Anda yakin ingin menyetujui pendaftaran akun ini?')) {
            approveRegistration({ token, id });
        }
    };

    const handleToggleStatus = (newStatus: boolean) => {
        const action = newStatus ? 'mengaktifkan' : 'menonaktifkan';
        if (window.confirm(`Apakah Anda yakin ingin ${action} akun ini?`)) {
            updateStatus({ token, id, status: newStatus });
        }
    };

    const rawStatus = userData?.status_account_label || userData?.approval_status_label || (userData?.status_account === true ? 'Aktif' : userData?.status_account === false ? 'Nonaktif' : '');
    const currentStatus = String(rawStatus || '').toLowerCase();

    const isAktif = currentStatus === 'aktif' || currentStatus === 'disetujui';
    const isNonaktif = currentStatus === 'nonaktif' || currentStatus === 'tidak aktif';
    const isPending = !isAktif && !isNonaktif;

    const statusDisplay = isAktif ? 'Aktif' : isNonaktif ? 'Nonaktif' : '-';

    return (
        <DashboardLayout showNav={false}>
            <div className="max-w-5xl mx-auto">
                <nav className="flex items-center text-sm text-gray-500 mb-5 gap-2">
                    <Link href="/v2/superadmin" className="hover:text-black transition-colors">Dashboard</Link>
                    <ChevronRight size={14} />
                    <Link href="/v2/superadmin/akun" className="hover:text-black transition-colors">Akun</Link>
                    <ChevronRight size={14} />
                    <span className="text-black">Detail Akun</span>
                </nav>

                {/* Title */}
                <h1 className="text-2xl font-bold mb-5">Detail Akun</h1>

                {/* Card Container */}
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 space-y-4">
                        <h1 className='text-xl font-semibold'>Data Akun</h1>

                        {/* Nama */}
                        <TextInput
                            id="nama"
                            label="Nama"
                            value={userData?.name || ''}
                            onChange={() => { }}
                            required={false}
                            disabled
                        />

                        {/* Email */}
                        <TextInput
                            id="email"
                            label="Email"
                            value={userData?.email || ''}
                            onChange={() => { }}
                            required={false}
                            disabled
                        />

                        {/* No. Telepon WhatsApp */}
                        <TextInput
                            id="wa"
                            label="No. Telepon WhatsApp"
                            value={userData?.phone || ''}
                            onChange={() => { }}
                            required={false}
                            disabled
                        />

                        {/* No Surat */}
                        <TextInput
                            id="no_surat"
                            label="No Surat"
                            value={userData?.recommendation_ref_number || '-'}
                            onChange={() => { }}
                            required={false}
                            disabled
                        />

                        {/* Role */}
                        <TextInput
                            id="role"
                            label="Role"
                            value={userData?.role || ''}
                            onChange={() => { }}
                            required={false}
                            disabled
                        />

                        {/* Instansi */}
                        <TextInput
                            id="instansi"
                            label="Instansi"
                            value={userData?.organization?.name || '-'}
                            onChange={() => { }}
                            required={false}
                            disabled
                        />

                        {/* Preview Dokumen */}
                        <FileInput
                            id="preview-dokumen"
                            label="Preview Dokumen"
                            initialUrl={userData?.recommendation_files?.[0]?.file_url || null}
                            onChange={() => { }}
                            required={false}
                            disabled
                        />

                        {/* <div>
                            <label className="block text-sm font-semibold text-black mb-2">
                                Preview Dokumen
                            </label>
                            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-3">
                                <FileText size={40} className="text-navy-900" />
                                <p className="text-sm font-medium text-gray-700">Surat Permohonan Admin Kab/ Kota.pdf</p>
                                <Link href="#" className="text-sm font-bold text-navy-600 hover:text-navy-800 underline">
                                    Lihat
                                </Link>
                            </div>
                        </div> */}

                        {/* Status Akun */}
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <TextInput
                                    id="status"
                                    label="Status Akun"
                                    value={statusDisplay}
                                    onChange={() => { }}
                                    required={false}
                                    disabled
                                />
                            </div>
                            <div className='flex gap-2'>
                                {isPending ? (
                                    <>
                                        <ButtonComponent
                                            label="Setujui Aktivasi"
                                            onClick={handleApprove}
                                            disabled={isApproving}
                                        />
                                        <ButtonComponent
                                            label="Tolak"
                                            className="text-red-500 border-red-500"
                                            onClick={() => setIsRejectionModalOpen(true)}
                                            secondary={true}
                                            disabled={isRejecting}
                                        />
                                    </>
                                ) : isAktif ? (
                                    <ButtonComponent
                                        label="Nonaktifkan Akun"
                                        className="text-red-500 border-red-500 hover:bg-red-50"
                                        onClick={() => handleToggleStatus(false)}
                                        secondary={true}
                                        disabled={isUpdating}
                                    />
                                ) : isNonaktif ? (
                                    <ButtonComponent
                                        label="Aktifkan Akun"
                                        onClick={() => handleToggleStatus(true)}
                                        disabled={isUpdating}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onSubmit={(note) => {
                    rejectRegistration({ token, id, note });
                    setIsRejectionModalOpen(false);
                }}
            />
        </DashboardLayout>
    );
};

export default DetailAkunPage;
