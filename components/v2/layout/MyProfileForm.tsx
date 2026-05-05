"use client";

import React from 'react'
import TextInput from '../inputs/TextInput'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/lib/config'

const MyProfileForm = () => {
    const { token } = useAuth();

    const { data: profileResponse, isLoading } = useQuery({
        queryKey: ['auth', 'profile'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        },
        enabled: !!token
    });

    const user = profileResponse?.data?.user;
    const organization = profileResponse?.data?.organization;

    return (
        <div className="max-w-xl mx-auto space-y-5 pb-10">
            <div className='space-y-4 bg-white p-6 shadow-sm rounded-lg'>
                <h1 className='text-xl font-semibold'>Profil Saya</h1>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                <div className="h-10 bg-gray-100 rounded-lg w-full animate-pulse border border-gray-200"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Nama */}
                        <TextInput
                            id="nama"
                            label="Nama"
                            value={user?.name || ''}
                            onChange={() => { }}
                            disabled={true}
                        />

                        {/* Email */}
                        <TextInput
                            id="email"
                            label="Email"
                            value={user?.email || ''}
                            onChange={() => { }}
                            disabled={true}
                        />

                        {/* No. WhatsApp */}
                        <TextInput
                            id="phone"
                            label="No. WhatsApp"
                            value={user?.phone || ''}
                            onChange={() => { }}
                            disabled={true}
                        />

                        {/* Role */}
                        <TextInput
                            id="role"
                            label="Role"
                            value={user?.role || ''}
                            onChange={() => { }}
                            disabled={true}
                        />

                        {/* Instansi */}
                        <TextInput
                            id="instansi"
                            label="Instansi"
                            value={organization?.name || ''}
                            onChange={() => { }}
                            disabled={true}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyProfileForm