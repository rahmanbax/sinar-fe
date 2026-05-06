"use client";

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import TextInput from '../inputs/TextInput';
import FileInput from '../inputs/FileInput';
import PasswordInput from '../inputs/PasswordInput';
import DropdownInput from '../inputs/DropdownInput';
import ButtonComponent from '../buttons/ButtonComponent';
import SelectionButtonComponent from '../buttons/SelectionButtonComponent';
import { useCreateManualMemberMutation, useImportMemberMutation } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Download } from 'lucide-react';

interface FormValues {
    nama: string;
    email: string;
    no_telepon: string;
    role: string;
    password: string;
    konfirmasi_password: string;
    no_surat: string;
    file_surat_permohonan: File | null;
}

interface XlsxFormValues {
    role: string;
    userFile: File | null;
    noSuratRekomendasi: string;
    suratRekomendasi: File | null;
}

const VerificatorAndSurveyorRegistrationForm = () => {
    const router = useRouter();
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'formulir' | 'xlsx'>('formulir');

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            nama: '',
            email: '',
            no_telepon: '',
            role: user?.role || 'verificator',
            password: '',
            konfirmasi_password: '',
            no_surat: '',
            file_surat_permohonan: null,
        }
    });

    const { control: xlsxControl, handleSubmit: handleXlsxSubmit, watch: watchXlsx } = useForm<XlsxFormValues>({
        defaultValues: {
            role: user?.role || 'verificator',
            userFile: null,
            noSuratRekomendasi: '',
            suratRekomendasi: null,
        }
    });



    const createMemberMutation = useCreateManualMemberMutation();

    const onSubmit = (data: FormValues) => {
        if (data.password !== data.konfirmasi_password) {
            alert("Password dan konfirmasi password tidak cocok");
            return;
        }

        if (!data.file_surat_permohonan) {
            alert("File surat permohonan wajib diunggah");
            return;
        }

        createMemberMutation.mutate({
            token,
            name: data.nama,
            email: data.email,
            phone: data.no_telepon,
            role: data.role,
            password: data.password,
            password_confirmation: data.konfirmasi_password,
            recommendation_file: data.file_surat_permohonan,
            ref_number: data.no_surat,
        }, {
            onSuccess: () => {
                router.push('/v2/verifikator-provinsi/tim-saya');
            },
            onError: (error: any) => {
                alert(error.message || "Terjadi kesalahan saat menambahkan akun");
            }
        });
    };

    const importMemberMutation = useImportMemberMutation();

    const handleImportMember = (data: XlsxFormValues) => {
        if (!data.userFile || !data.suratRekomendasi) {
            alert("Harap lengkapi file yang diperlukan.");
            return;
        }

        importMemberMutation.mutate({
            token,
            role: data.role,
            user_file: data.userFile,
            recommendation_file: data.suratRekomendasi,
            ref_number: data.noSuratRekomendasi
        }, {
            onSuccess: () => {
                alert("Import berhasil dilakukan");
                router.push('/v2/verifikator-provinsi/tim-saya');
            },
            onError: (err) => {
                alert("Gagal melakukan import: " + err.message);
            }
        });
    };

    const isPending = createMemberMutation.isPending;
    const isImportPending = importMemberMutation.isPending;



    return (
        <div className="max-w-xl mx-auto space-y-5">
            <div className='space-y-4 bg-white p-6 shadow-sm rounded-lg'>
                <h1 className='text-xl font-semibold'>Tambah Akun Verifikator/ Surveyor</h1>
                <div className='flex gap-2 '>
                    <SelectionButtonComponent
                        label='Dengan Formulir'
                        onClick={() => setActiveTab('formulir')}
                        className='w-full'
                        selected={activeTab === 'formulir'}
                    />
                    <SelectionButtonComponent
                        label='Dengan Data .xlsx'
                        onClick={() => setActiveTab('xlsx')}
                        className='w-full'
                        selected={activeTab === 'xlsx'}
                    />
                </div>
            </div>
            <div className='space-y-4 bg-white p-6 shadow-sm rounded-lg'>
                {activeTab === 'formulir' && (
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                        <div className='space-y-4'>

                            <Controller
                                name="role"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DropdownInput
                                        label='Role'
                                        value={field.value}
                                        onChange={field.onChange}
                                        options={[
                                            { label: 'Verifikator', value: 'verificator' },
                                            { label: 'Surveyor', value: 'surveyor' }
                                        ]}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="nama"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='nama'
                                        label='Nama'
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='email'
                                        label='Email'
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="no_telepon"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='no_telepon'
                                        label='No. Telepon'
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <PasswordInput
                                        id='password'
                                        label='Password'
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="konfirmasi_password"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <PasswordInput
                                        id='konfirmasi_password'
                                        label='Konfirmasi Password'
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="no_surat"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='no_surat'
                                        label='No. Surat'
                                        value={field.value}
                                        onChange={field.onChange}
                                        required
                                    />
                                )}
                            />

                            <Controller
                                name="file_surat_permohonan"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <FileInput
                                        id='file_surat_permohonan'
                                        label='File Surat Permohonan'
                                        onChange={field.onChange}
                                        accept='.pdf'
                                        required
                                    />
                                )}
                            />

                            <ButtonComponent
                                label={isPending ? "Memproses..." : "Tambah Akun"}
                                type="submit"
                                disabled={isPending}
                                className='w-full'
                                icon={isPending ? <Loader2 className="animate-spin" size={16} /> : undefined}
                            />
                        </div>
                    </form>
                )}

                {activeTab === 'xlsx' && (
                    <form onSubmit={handleXlsxSubmit(handleImportMember)} className='space-y-5'>
                        <Controller
                            name="role"
                            control={xlsxControl}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <DropdownInput
                                    label='Role'
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={[
                                        { label: 'Verifikator', value: 'verificator' },
                                        { label: 'Surveyor', value: 'surveyor' }
                                    ]}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="userFile"
                            control={xlsxControl}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FileInput
                                    id='userFile'
                                    label='File Data User'
                                    onChange={(file) => field.onChange(file)}
                                    required
                                    accept='.xlsx'
                                    maxSizeMB={5}
                                />
                            )}
                        />
                        <ButtonComponent
                            icon={<Download size={16} />}
                            label='Download Template .xlsx'
                            className='w-full'
                            secondary={true}
                            type='button'
                            onClick={() => window.open('https://sinardev.com/template_excel/import_users.xlsx', '_blank')}
                        />
                        <Controller
                            name="noSuratRekomendasi"
                            control={xlsxControl}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <TextInput
                                    id='noSuratRekomendasi'
                                    label='No. Surat Rekomendasi'
                                    onChange={field.onChange}
                                    value={field.value}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="suratRekomendasi"
                            control={xlsxControl}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FileInput
                                    id='suratRekomendasi'
                                    label='Surat Rekomendasi'
                                    onChange={(file) => field.onChange(file)}
                                    required
                                    accept='.pdf'
                                    maxSizeMB={2}
                                />
                            )}
                        />
                        <ButtonComponent
                            label={isImportPending ? 'Memproses...' : 'Tambah Akun'}
                            className='w-full'
                            disabled={isImportPending}
                            type="submit"
                        />
                    </form>
                )}
            </div>
        </div>
    )
}

export default VerificatorAndSurveyorRegistrationForm;