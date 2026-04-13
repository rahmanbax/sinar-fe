import React, { useState } from 'react'
import TextInput from '../inputs/TextInput'
import PasswordInput from '../inputs/PasswordInput'
import ButtonComponent from '../buttons/ButtonComponent'
import { X } from 'lucide-react'
import { useLoginMutation, useRegisterMutation } from '@/hooks/useAuth'

type AuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [isRegistering, setIsRegistering] = useState(false)

    // Login states
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    // Register states
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [regPassword, setRegPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const loginMutation = useLoginMutation({
        onSuccess: (data) => {
            // Tindakan sukses: token biasanya disimpan di cookie/context
            console.log("Login sukses!", data);
            onClose(); // Tutup modal otomatis ketika sukses
        },
        onError: (error) => {
            // Tindakan error
            alert(error.message);
        }
    });

    const registerMutation = useRegisterMutation({
        onSuccess: () => {
            onClose(); // Modal lenyap otomatis karena user telah berhasil terotentikasi & dialihkan
        },
        onError: (error) => {
            alert(error.message);
        }
    });

    const handleLogin = () => {
        if (!email || !password) {
            alert('Mohon isi email dan kata sandi terlebih dahulu.');
            return;
        }
        loginMutation.mutate({ email, password });
    };

    const handleRegister = () => {
        if (!name || !email || !phone || !regPassword || !confirmPassword) {
            alert('Mohon isi semua form pendaftaran.');
            return;
        }

        if (regPassword !== confirmPassword) {
            alert('Konfirmasi kata sandi tidak cocok!');
            return;
        }

        registerMutation.mutate({
            name,
            email,
            phone_number: phone,
            password: regPassword,
            password_confirmation: confirmPassword
        });
    };

    if (!isOpen) return null;

    const toggleMode = () => {
        setIsRegistering(!isRegistering)
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-lg p-5 bg-white space-y-5 rounded-xl">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    <X size={24} />
                </button>

                <h1 className="text-2xl font-bold text-gray-900 font-outfit">
                    {isRegistering ? 'Daftar Akun' : 'Masuk'}
                </h1>

                {isRegistering ? (
                    <div className='space-y-4'>
                        <TextInput
                            id='name'
                            label='Nama'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={true}
                        />
                        <TextInput
                            id='phone'
                            label='No Telepon'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required={true}
                        />
                        <TextInput
                            id='email'
                            label='Email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={true}
                        />
                        <PasswordInput
                            id='reg-password'
                            label='Kata Sandi'
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required={true}
                        />
                        <PasswordInput
                            id='confirm-password'
                            label='Konfirmasi Kata Sandi'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={true}
                        />
                        <div className='space-y-4'>
                            <ButtonComponent
                                label={registerMutation.isPending ? 'Memproses...' : 'Daftar'}
                                onClick={handleRegister}
                                className="w-full justify-center py-3"
                                disabled={registerMutation.isPending}
                            />
                            <div className='text-center text-gray-600'>
                                Sudah Punya Akun? {' '}
                                <button
                                    onClick={toggleMode}
                                    className='font-semibold text-navy-500 hover:text-navy-500 cursor-pointer'
                                >
                                    Masuk
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className='space-y-4'>
                            <TextInput
                                id='email'
                                label='Email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required={true}
                            />
                            <PasswordInput
                                id='password'
                                label='Kata Sandi'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={true}
                            />
                            <div className="flex justify-end">
                                <button className='text-sm font-medium text-navy-500'>
                                    Lupa Kata Sandi?
                                </button>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <ButtonComponent
                                label={loginMutation.isPending ? 'Memproses...' : 'Masuk'}
                                onClick={handleLogin}
                                className="w-full justify-center py-3"
                                disabled={loginMutation.isPending}
                            />
                            <div className='text-center text-gray-600'>
                                Tidak Punya Akun? {' '}
                                <button
                                    onClick={toggleMode}
                                    className='font-semibold text-navy-500 hover:text-navy-500 cursor-pointer'
                                >
                                    Daftar Akun
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AuthModal