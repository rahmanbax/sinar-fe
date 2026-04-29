"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import TextInput from '../inputs/TextInput';
import FileInput from '../inputs/FileInput';
import PasswordInput from '../inputs/PasswordInput';
import ButtonComponent from '../buttons/ButtonComponent';
import { useCreateManualMemberMutation } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface FormValues {
    nama: string;
    email: string;
    no_telepon: string;
    password: string;
    konfirmasi_password: string;
    no_surat: string;
    file_surat_permohonan: File | null;
}

const VerificatorAndSurveyorRegistrationForm = () => {
    const router = useRouter();
    const { token, user } = useAuth();
    
    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            nama: '',
            email: '',
            no_telepon: '',
            password: '',
            konfirmasi_password: '',
            no_surat: '',
            file_surat_permohonan: null,
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
            role: user?.role || "verificator", // Role based on currently logged in user
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

    const isPending = createMemberMutation.isPending;

    return (
        <div className="max-w-xl mx-auto space-y-5">
            <div className='space-y-4 bg-white p-6 shadow-sm rounded-lg'>
                <h1 className='text-xl font-semibold'>Tambah Akun Tim</h1>
                
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                    <div className='space-y-4'>
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
            </div>
        </div>
    )
}

export default VerificatorAndSurveyorRegistrationForm;