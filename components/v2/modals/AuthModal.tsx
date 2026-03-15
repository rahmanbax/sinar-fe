import React, { useState } from 'react'
import TextInput from '../inputs/TextInput'
import PasswordInput from '../inputs/PasswordInput'
import ButtonComponent from '../buttons/ButtonComponent'
import { X } from 'lucide-react'

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
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
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
                                label='Daftar'
                                onClick={() => { }}
                                className="w-full justify-center py-3"
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
                                id='username'
                                label='Username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={true}
                            />
                            <PasswordInput
                                id='password'
                                label='Password'
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
                                label='Masuk'
                                onClick={() => { }}
                                className="w-full justify-center py-3"
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