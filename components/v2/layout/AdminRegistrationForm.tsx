"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DropdownInput from '../inputs/DropdownInput';
import ButtonComponent from '../buttons/ButtonComponent';
import FileInput from '../inputs/FileInput';
import TextInput from '../inputs/TextInput';
import PasswordInput from '../inputs/PasswordInput';
import { useAuth } from '@/contexts/AuthContext';
import SelectionButtonComponent from '../buttons/SelectionButtonComponent';
import { useOrganizations, useRegions, useCreateManualAdminMutation, useImportAdminMutation, useGenerateAdminTokenMutation } from '@/hooks/useAdmin';
import { Download, Copy, Check, Loader2, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FormValues {
    instansi: string;
    orgId: string;
    orgName: string;
    regionCode: string;
    noTelepon: string;
    emailInstansi: string;
    nama: string;
    password: string;
    konfirmasiPassword: string;
    noSurat: string;
    suratPermohonan: File | null;
    userFile: File | null;
    noSuratRekomendasi: string;
    suratRekomendasi: File | null;
    expires_in_day: string;
    max_uses: string;
}

const instansiOptions = [
    { label: 'BIG', value: 'big' },
    { label: 'K/L/P', value: 'admin_klp' },
    { label: 'Provinsi', value: 'admin_provinsi' },
    { label: 'Kab/Kota', value: 'admin_kabkota' },
];

const AdminRegistrationForm = () => {
    const { control, handleSubmit, watch, reset, setValue } = useForm<FormValues>({
        defaultValues: {
            instansi: '',
            orgId: '',
            orgName: '',
            regionCode: '',
            noTelepon: '',
            emailInstansi: '',
            nama: '',
            password: '',
            konfirmasiPassword: '',
            noSurat: '',
            suratPermohonan: null,
            userFile: null,
            noSuratRekomendasi: '',
            suratRekomendasi: null,
            expires_in_day: '',
            max_uses: '',
        }
    });

    const router = useRouter();
    const instansi = watch('instansi');

    const [activeTab, setActiveTab] = useState<'formulir' | 'xlsx' | 'link'>('formulir');
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [isCreatingNewOrg, setIsCreatingNewOrg] = useState(false);
    const [orgSearchQuery, setOrgSearchQuery] = useState('');
    const [regionSearchQuery, setRegionSearchQuery] = useState('');

    const { token, user } = useAuth();

    // Fetch orgs by search query (for K/L/P)
    const { data: orgSearchResponse } = useOrganizations(undefined, orgSearchQuery || undefined);

    // Fetch regions based on selected role
    const regionLevel = instansi === 'admin_provinsi' ? 'PROVINCE' : instansi === 'admin_kabkota' ? 'CITY' : undefined;
    const { data: regionsResponse } = useRegions(
        regionLevel as 'PROVINCE' | 'CITY',
        regionSearchQuery || undefined
    );

    const orgOptions = (orgSearchResponse?.data ?? []).map((org: any) => ({
        label: org.name,
        value: String(org.id),
    }));

    const regionOptions = (regionsResponse?.data ?? []).map((region: any) => ({
        label: region.name,
        value: region.code,
    }));

    // Reset dependent fields when instansi changes
    useEffect(() => {
        setValue('orgId', '');
        setValue('orgName', '');
        setValue('regionCode', '');
        setIsCreatingNewOrg(false);
        setOrgSearchQuery('');
        setRegionSearchQuery('');
    }, [instansi, setValue]);

    const { mutate: createManualAdmin, isPending } = useCreateManualAdminMutation({
        onSuccess: () => {
            alert('Akun admin berhasil didaftarkan');
            reset();
            if (user?.role) router.push(`/v2/${user.role}/akun`);
        },
        onError: (err) => {
            alert('Pendaftaran gagal: ' + err.message);
        }
    });

    const handleCreateAdmin = (data: FormValues) => {
        if (data.password !== data.konfirmasiPassword) {
            alert('Konfirmasi kata sandi tidak cocok');
            return;
        }

        const isAdminBig = data.instansi === 'big';

        if (data.instansi === 'admin_klp') {
            const finalOrgId = isCreatingNewOrg ? data.orgName : data.orgId;
            if (!finalOrgId) {
                alert('Silakan pilih atau isi nama organisasi');
                return;
            }
            createManualAdmin({
                token,
                is_admin_big: false,
                org_id: finalOrgId,
                name: data.nama,
                email: data.emailInstansi,
                phone: data.noTelepon,
                password: data.password,
                password_confirmation: data.konfirmasiPassword,
                recommendation_file: data.suratPermohonan as File,
                ref_number: data.noSurat,
            });
        } else if (data.instansi === 'admin_provinsi' || data.instansi === 'admin_kabkota') {
            if (!data.regionCode) {
                alert('Silakan pilih wilayah');
                return;
            }
            createManualAdmin({
                token,
                is_admin_big: false,
                region_id: data.regionCode,
                name: data.nama,
                email: data.emailInstansi,
                phone: data.noTelepon,
                password: data.password,
                password_confirmation: data.konfirmasiPassword,
                recommendation_file: data.suratPermohonan as File,
                ref_number: data.noSurat,
            });
        } else {
            // BIG
            createManualAdmin({
                token,
                is_admin_big: true,
                name: data.nama,
                email: data.emailInstansi,
                phone: data.noTelepon,
                password: data.password,
                password_confirmation: data.konfirmasiPassword,
                recommendation_file: data.suratPermohonan as File,
                ref_number: data.noSurat,
            });
        }
    };

    const { mutate: importAdmin, isPending: isImportPending } = useImportAdminMutation({
        onSuccess: () => {
            alert('Data akun berhasil ditambahkan melalui impor');
            reset();
            if (user?.role) router.push(`/v2/${user.role}/akun`);
        },
        onError: (err) => {
            alert('Impor gagal: ' + err.message);
        }
    });

    const handleImportAdmin = (data: FormValues) => {
        if (data.instansi === 'admin_klp') {
            const finalOrgId = isCreatingNewOrg ? data.orgName : data.orgId;
            if (!finalOrgId) {
                alert('Silakan pilih atau isi nama organisasi');
                return;
            }
            importAdmin({
                token,
                org_id: finalOrgId,
                user_file: data.userFile as File,
                recommendation_file: data.suratRekomendasi as File,
                ref_number: data.noSuratRekomendasi,
            });
        } else if (data.instansi === 'admin_provinsi' || data.instansi === 'admin_kabkota') {
            if (!data.regionCode) {
                alert('Silakan pilih wilayah');
                return;
            }
            importAdmin({
                token,
                region_id: data.regionCode,
                user_file: data.userFile as File,
                recommendation_file: data.suratRekomendasi as File,
                ref_number: data.noSuratRekomendasi,
            });
        } else {
            alert('Impor via xlsx tidak tersedia untuk Admin BIG');
        }
    };

    const { mutate: generateToken, isPending: isGeneratePending } = useGenerateAdminTokenMutation({
        onSuccess: (res) => {
            setGeneratedData(res.data);
            alert('Undangan pendaftaran admin berhasil dibuat');
        },
        onError: (err) => {
            alert('Generate gagal: ' + err.message);
        }
    });

    const handleGenerateLink = (data: FormValues) => {
        if (!data.expires_in_day || !data.max_uses) {
            alert('Silakan isi masa berlaku dan maksimal pakai');
            return;
        }

        // Map 'big' → 'admin_big' untuk institution_type
        const institutionType = data.instansi === 'big' ? 'admin_big' : data.instansi;

        if (data.instansi === 'admin_klp') {
            const finalOrgId = isCreatingNewOrg ? data.orgName : data.orgId;
            if (!finalOrgId) {
                alert('Silakan pilih atau isi nama organisasi');
                return;
            }
            generateToken({
                token,
                institution_type: institutionType,
                org_id: finalOrgId,
                expires_in_days: data.expires_in_day,
                max_uses: data.max_uses,
            });
        } else if (data.instansi === 'admin_provinsi' || data.instansi === 'admin_kabkota') {
            if (!data.regionCode) {
                alert('Silakan pilih wilayah');
                return;
            }
            generateToken({
                token,
                institution_type: institutionType,
                region_id: data.regionCode,
                expires_in_days: data.expires_in_day,
                max_uses: data.max_uses,
            });
        } else {
            // BIG: tidak perlu org_id atau region_id
            generateToken({
                token,
                institution_type: 'admin_big',
                expires_in_days: data.expires_in_day,
                max_uses: data.max_uses,
            });
        }
    };

    const handleCopy = () => {
        if (generatedData?.token) {
            const link = `${window.location.origin}/v2/daftar-akun-admin?token=${generatedData.token}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Shared conditional field rendering based on instansi
    const renderInstansiFields = () => {
        if (instansi === 'admin_klp') {
            return (
                <div className="space-y-2">
                    {!isCreatingNewOrg ? (
                        <>
                            <Controller
                                name="orgId"
                                control={control}
                                render={({ field }) => (
                                    <DropdownInput
                                        label='Organisasi (K/L/P)'
                                        placeholder='Ketik untuk mencari organisasi...'
                                        onChange={field.onChange}
                                        value={field.value}
                                        options={orgOptions}
                                        searchable={true}
                                        onSearchChange={setOrgSearchQuery}
                                        required
                                    />
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setIsCreatingNewOrg(true)}
                                className="flex items-center gap-1 text-sm text-navy-500 hover:underline"
                            >
                                <Plus size={14} /> Buat organisasi baru
                            </button>
                        </>
                    ) : (
                        <>
                            <Controller
                                name="orgName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='orgName'
                                        label='Nama Organisasi Baru'
                                        onChange={field.onChange}
                                        value={field.value}
                                        required
                                    />
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setIsCreatingNewOrg(false)}
                                className="flex items-center gap-1 text-sm text-navy-500 hover:underline"
                            >
                                <ArrowLeft size={14} /> Pilih organisasi yang sudah ada
                            </button>
                        </>
                    )}
                </div>
            );
        }

        if (instansi === 'admin_provinsi' || instansi === 'admin_kabkota') {
            const label = instansi === 'admin_provinsi' ? 'Provinsi' : 'Kabupaten / Kota';
            const placeholder = instansi === 'admin_provinsi' ? 'Ketik nama provinsi...' : 'Ketik nama kabupaten/kota...';
            return (
                <Controller
                    name="regionCode"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <DropdownInput
                            label={label}
                            placeholder={placeholder}
                            onChange={field.onChange}
                            value={field.value}
                            options={regionOptions}
                            searchable={true}
                            onSearchChange={setRegionSearchQuery}
                            required
                        />
                    )}
                />
            );
        }

        return null; // BIG: tidak ada field tambahan
    };

    return (
        <div className="max-w-xl mx-auto space-y-5">
            <div className='space-y-4 bg-white p-6 shadow-sm rounded-lg'>
                <h1 className='text-xl font-semibold'>Tambah Akun Admin</h1>
                <div className='flex gap-2'>
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
                    <SelectionButtonComponent
                        label='Dengan Tautan'
                        onClick={() => {
                            setActiveTab('link');
                            setGeneratedData(null);
                        }}
                        className='w-full'
                        selected={activeTab === 'link'}
                    />
                </div>
            </div>

            <div className='space-y-4 bg-white p-6 shadow-sm rounded-lg'>
                {activeTab === 'formulir' && (
                    <form onSubmit={handleSubmit(handleCreateAdmin)} className='space-y-5'>
                        <div className='space-y-4'>
                            <Controller
                                name="instansi"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DropdownInput
                                        label='Role'
                                        placeholder='Pilih Role'
                                        onChange={field.onChange}
                                        value={field.value}
                                        options={instansiOptions}
                                        required
                                    />
                                )}
                            />
                            {renderInstansiFields()}
                            <Controller
                                name="noTelepon"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='noTelepon'
                                        label='No Telepon WhatsApp'
                                        onChange={field.onChange}
                                        value={field.value}
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="emailInstansi"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='emailInstansi'
                                        label='Email Instansi'
                                        onChange={field.onChange}
                                        value={field.value}
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
                                        onChange={field.onChange}
                                        value={field.value}
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
                                        label='Kata Sandi'
                                        onChange={field.onChange}
                                        value={field.value}
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="konfirmasiPassword"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <PasswordInput
                                        id='konfirmasiPassword'
                                        label='Konfirmasi Kata Sandi'
                                        onChange={field.onChange}
                                        value={field.value}
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="noSurat"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='noSurat'
                                        label='No. Surat'
                                        onChange={field.onChange}
                                        value={field.value}
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="suratPermohonan"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <FileInput
                                        id='suratPermohonan'
                                        label='Surat Permohonan'
                                        onChange={(file) => field.onChange(file)}
                                        required
                                        accept='.pdf'
                                        maxSizeMB={2}
                                    />
                                )}
                            />
                        </div>
                        <ButtonComponent
                            label={isPending ? 'Memproses...' : 'Tambah Akun'}
                            icon={isPending ? <Loader2 className="animate-spin" size={16} /> : undefined}
                            onClick={() => { }}
                            className='w-full'
                            disabled={isPending}
                            type="submit"
                        />
                    </form>
                )}

                {activeTab === 'xlsx' && (
                    <form onSubmit={handleSubmit(handleImportAdmin)} className='space-y-5'>
                        <Controller
                            name="instansi"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <DropdownInput
                                    label='Role'
                                    placeholder='Pilih Role'
                                    onChange={field.onChange}
                                    value={field.value}
                                    options={instansiOptions.filter(o => o.value !== 'big')}
                                    required
                                />
                            )}
                        />
                        {renderInstansiFields()}
                        <Controller
                            name="userFile"
                            control={control}
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
                            control={control}
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
                            control={control}
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
                            onClick={() => { }}
                            className='w-full'
                            disabled={isImportPending}
                            type="submit"
                        />
                    </form>
                )}

                {activeTab === 'link' && (
                    <div className='space-y-5'>
                        <form onSubmit={handleSubmit(handleGenerateLink)} className='space-y-5'>
                            {generatedData && (
                                <div className="bg-navy-50 border border-navy-500 rounded-lg p-4 space-y-4">
                                    <h3 className="font-semibold text-navy-500">Link Berhasil Dibuat!</h3>
                                    <div className="space-y-1">
                                        <p className="font-medium">{generatedData.organization?.name || generatedData.region?.name || '-'}</p>
                                        <div className="flex items-center gap-1 border border-gray-300 bg-white rounded-lg">
                                            <input
                                                readOnly
                                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/v2/daftar-akun-admin?token=${generatedData.token}`}
                                                className="w-full bg-white truncate rounded-lg px-3 py-2 text-sm outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCopy}
                                                className="p-3 cursor-pointer text-navy-500 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                                title="Salin Link"
                                            >
                                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <Controller
                                name="instansi"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DropdownInput
                                        label='Role'
                                        placeholder='Pilih Role'
                                        onChange={field.onChange}
                                        value={field.value}
                                        options={instansiOptions}
                                        required
                                    />
                                )}
                            />
                            {renderInstansiFields()}
                            <Controller
                                name="expires_in_day"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='expires_in_day'
                                        label='Berlaku Selama (hari)'
                                        onChange={field.onChange}
                                        value={field.value}
                                        required
                                    />
                                )}
                            />
                            <Controller
                                name="max_uses"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextInput
                                        id='max_uses'
                                        label='Maksimal Penggunaan'
                                        onChange={field.onChange}
                                        value={field.value}
                                        required
                                    />
                                )}
                            />
                            <ButtonComponent
                                label={isGeneratePending ? 'Memproses...' : 'Buat Tautan'}
                                onClick={() => { }}
                                className='w-full'
                                disabled={isGeneratePending}
                                type="submit"
                            />
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRegistrationForm;
