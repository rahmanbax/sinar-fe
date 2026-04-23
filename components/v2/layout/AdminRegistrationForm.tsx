import React from 'react'
import DropdownInput from '../inputs/DropdownInput';
import ButtonComponent from '../buttons/ButtonComponent';
import FileInput from '../inputs/FileInput';
import TextInput from '../inputs/TextInput';
import PasswordInput from '../inputs/PasswordInput';
import { useAdminRegistrationStore } from '@/store/useAdminRegistrationStore';
import { useAuth } from '@/contexts/AuthContext';
import SelectionButtonComponent from '../buttons/SelectionButtonComponent';
import { useOrganizations, useCreateManualAdminMutation, useImportAdminMutation } from '@/hooks/useAdmin';

const AdminRegistrationForm = () => {
    const {
        instansi, setInstansi,
        provinsi, setProvinsi,
        kabupaten, setKabupaten,
        noTelepon, setNoTelepon,
        emailInstansi, setEmailInstansi,
        nama, setNama,
        password, setPassword,
        konfirmasiPassword, setKonfirmasiPassword,
        noSurat, setNoSurat,
        suratPermohonan, setSuratPermohonan,
        userFile, setUserFile,
        noSuratRekomendasi, setNoSuratRekomendasi,
        suratRekomendasi, setSuratRekomendasi,
        isAdminBig, setIsAdminBig,
    } = useAdminRegistrationStore();

    const [activeTab, setActiveTab] = React.useState<'formulir' | 'xlsx'>('formulir');

    const { token } = useAuth();
    const { data: organizationResponse } = useOrganizations(token);
    
    const instansiOptions = React.useMemo(() => {
        if (!organizationResponse?.data) return [];
        return organizationResponse.data.map((org: any) => ({
            label: org.name,
            value: org.id,
        }));
    }, [organizationResponse]);

    const { mutate: createManualAdmin, isPending } = useCreateManualAdminMutation({
        onSuccess: () => {
            alert('Akun admin berhasil didaftarkan');
        },
        onError: (err) => {
            alert('Pendaftaran gagal: ' + err.message);
        }
    });

    const handleCreateAdmin = () => {
        if (!instansi || !nama || !emailInstansi || !noTelepon || !password || !suratPermohonan || !noSurat) {
            alert('Silakan lengkapi seluruh form');
            return;
        }

        if (password !== konfirmasiPassword) {
            alert('Konfirmasi kata sandi tidak cocok');
            return;
        }

        createManualAdmin({
            token,
            org_id: instansi,
            name: nama,
            email: emailInstansi,
            phone: noTelepon,
            password: password,
            password_confirmation: konfirmasiPassword,
            recommendation_file: suratPermohonan,
            ref_number: noSurat,
            is_admin_big: isAdminBig,
        });
    };

    const { mutate: importAdmin, isPending: isImportPending } = useImportAdminMutation({
        onSuccess: () => {
            alert('Data akun berhasil ditambahkan melalui impor');
        },
        onError: (err) => {
            alert('Impor gagal: ' + err.message);
        }
    });

    const handleImportAdmin = () => {
        if (!userFile || !suratRekomendasi || !noSuratRekomendasi || !instansi) {
            alert('Silakan lengkapi seluruh form import');
            return;
        }

        importAdmin({
            token,
            org_id: instansi,
            user_file: userFile,
            recommendation_file: suratRekomendasi,
            ref_number: noSuratRekomendasi,
        });
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
                </div>
            </div>
            {activeTab === 'formulir' && (
                <div className='bg-white shadow-sm rounded-lg p-6 space-y-5'>
                    <div className='space-y-4'>
                        <DropdownInput
                            label='Instansi'
                            placeholder='Pilih Instansi'
                            onChange={(val) => {
                                setInstansi(val);
                                // Reset child fields when parent changes
                                // setProvinsi("");
                                // setKabupaten("");
                            }}
                            value={instansi}
                            options={instansiOptions}
                            required
                        />
                        {/* Conditional Dropdown: Provinsi */}
                        {/* {(instansi === 'admin_provinsi' || instansi === 'admin_kab_kota') && (
                            <DropdownInput
                                label='Provinsi'
                                placeholder='Pilih Provinsi'
                                onChange={(val) => {
                                    setProvinsi(val);
                                    setKabupaten("");
                                }}
                                value={provinsi}
                                options={realProvinsiOptions}
                                searchable={true}
                                required
                            />
                        )} */}
                        {/* Conditional Dropdown: Kabupaten/Kota */}
                        {/* {instansi === 'admin_kab_kota' && (
                            <DropdownInput
                                label='Kabupaten/ Kota'
                                placeholder='Pilih Kabupaten/ Kota'
                                onChange={(val) => setKabupaten(val)}
                                value={kabupaten}
                                options={realKabupatenOptions}
                                searchable={true}
                                required
                            />
                        )} */}
                        <TextInput
                            id='noTelepon'
                            label='No Telepon WhatsApp'
                            onChange={(e) => setNoTelepon(e.target.value)}
                            value={noTelepon}
                            required
                        />
                        {/* email instansi */}
                        <TextInput
                            id='emailInstansi'
                            label='Email Instansi'
                            onChange={(e) => setEmailInstansi(e.target.value)}
                            value={emailInstansi}
                            required
                        />
                        {/* nama */}
                        <TextInput
                            id='nama'
                            label='Nama'
                            onChange={(e) => setNama(e.target.value)}
                            value={nama}
                            required
                        />
                        {/* kata sandi */}
                        <PasswordInput
                            id='password'
                            label='Kata Sandi'
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />
                        {/* konfirmasi kata sandi */}
                        <PasswordInput
                            id='konfirmasiPassword'
                            label='Konfirmasi Kata Sandi'
                            onChange={(e) => setKonfirmasiPassword(e.target.value)}
                            value={konfirmasiPassword}
                            required
                        />
                        {/* no surat */}
                        <TextInput
                            id='noSurat'
                            label='No. Surat'
                            onChange={(e) => setNoSurat(e.target.value)}
                            value={noSurat}
                            required
                        />
                        {/* file input pdf */}
                        <FileInput
                            id='suratPermohonan'
                            label='Surat Permohonan'
                            onChange={(file) => setSuratPermohonan(file as File)}
                            required
                            accept='.pdf'
                            maxSizeMB={2}
                        />
                    </div>
                    <ButtonComponent
                        label={isPending ? 'Memproses...' : 'Tambah Akun'}
                        onClick={handleCreateAdmin}
                        className='w-full'
                        disabled={isPending}
                    />
                </div>
            )}
            {activeTab === 'xlsx' && (
                <div className='bg-white shadow-sm rounded-lg p-6 space-y-5'>
                    <FileInput
                        id='userFile'
                        label='File Data User'
                        onChange={(file) => setUserFile(file as File)}
                        required
                        accept='.xlsx'
                        maxSizeMB={5}
                    />
                    {/* Nomor surat rekomendasi */}
                    <TextInput
                        id='noSuratRekomendasi'
                        label='No. Surat Rekomendasi'
                        onChange={(e) => setNoSuratRekomendasi(e.target.value)}
                        value={noSuratRekomendasi}
                        required
                    />
                    {/* Surat rekomendasi */}
                    <FileInput
                        id='suratRekomendasi'
                        label='Surat Rekomendasi'
                        onChange={(file) => setSuratRekomendasi(file as File)}
                        required
                        accept='.pdf'
                        maxSizeMB={2}
                    />
                    <DropdownInput
                        label='Instansi'
                        placeholder='Pilih Instansi'
                        onChange={(val) => {
                            setInstansi(val);
                        }}
                        value={instansi}
                        options={instansiOptions}
                        required
                    />
                    <ButtonComponent
                        label={isImportPending ? 'Memproses...' : 'Tambah Akun'}
                        onClick={handleImportAdmin}
                        className='w-full'
                        disabled={isImportPending}
                    />
                </div>
            )}
        </div>
    )
}

export default AdminRegistrationForm